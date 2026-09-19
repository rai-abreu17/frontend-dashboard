import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, catchError, map, of, switchMap, timer } from 'rxjs';
import { BoxService } from './box.service';
import { MeasurementService } from './measurement.service';
import { Box } from '../models/box.model';
import { Measurement } from '../models/measurement.model';
import { MeasurementStatus } from '../models/types';

export const LIVE_BOX_ID = 'b3';
const POLL_MS = 2000;

interface LatestScanHistoryEntry {
  sequence: number;
  boot_id: string;
  received_at: string;
  state: string;
  occupancy_fraction: number | null;
  coverage_fraction: number | null;
}

interface LatestScanResponse {
  box_id: string;
  boot_id?: string;
  sequence?: number;
  measurement_state: string;
  underlying_measurement_state?: string;
  is_previous_measurement?: boolean;
  occupancy_fraction: number | null;
  coverage_fraction?: number | null;
  received_at?: string;
  history: LatestScanHistoryEntry[];
}

/**
 * Faz polling de /api/latest para o box instrumentado (BOX-03) e alimenta
 * MeasurementService.setLiveMeasurements — dashboard, boxes e box-detail
 * refletem a leitura automaticamente, sem depender de qual página está aberta.
 * occupancy_fraction (0..1, escala da maquete) é convertido aqui para o volume
 * equivalente na escala industrial do box (occupancy_fraction * maxVolumeCapacityM3).
 */
@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  constructor(
    private http: HttpClient,
    private boxService: BoxService,
    private measurementService: MeasurementService
  ) {
    this.startLiveSync();
  }

  private startLiveSync() {
    this.boxService.getBoxById(LIVE_BOX_ID).pipe(
      switchMap(box => !box ? EMPTY : timer(0, POLL_MS).pipe(
        switchMap(() => this.http.get<LatestScanResponse>('/api/latest', { params: { box_id: box.code } })
          .pipe(catchError(() => of(null)))),
        map(dto => dto ? this.toMeasurements(dto, box) : [])
      ))
    ).subscribe(measurements => {
      if (measurements.length) this.measurementService.setLiveMeasurements(LIVE_BOX_ID, measurements);
    });
  }

  private toMeasurements(dto: LatestScanResponse, box: Box): Measurement[] {
    const current = this.toCurrentMeasurement(dto, box);
    const history = (dto.history ?? [])
      .filter(h => !(h.boot_id === dto.boot_id && h.sequence === dto.sequence))
      .map(h => this.toHistoryMeasurement(h, box));
    return current ? [current, ...history] : history;
  }

  private toCurrentMeasurement(dto: LatestScanResponse, box: Box): Measurement | undefined {
    const hasEverHadData = (dto.history?.length ?? 0) > 0 || dto.occupancy_fraction != null;
    if (!hasEverHadData) return undefined;

    let status: MeasurementStatus;
    if (dto.is_previous_measurement) status = 'VENCIDA';
    else if ((dto.underlying_measurement_state ?? dto.measurement_state) === 'partial') status = 'INCONCLUSIVA';
    else if (dto.measurement_state === 'unavailable') status = 'INVALIDA';
    else status = 'VALIDA';

    return {
      id: `live-${box.id}-${dto.boot_id ?? 'none'}-${dto.sequence ?? 0}`,
      boxId: box.id,
      capturedAt: dto.received_at ?? new Date().toISOString(),
      volumeM3: dto.occupancy_fraction != null ? dto.occupancy_fraction * box.maxVolumeCapacityM3 : null,
      status,
      coverageRatio: dto.coverage_fraction ?? null,
      source: 'LIVE_BENCH_SIMULATION'
    };
  }

  private toHistoryMeasurement(h: LatestScanHistoryEntry, box: Box): Measurement {
    const status: MeasurementStatus = h.state === 'valid' ? 'VALIDA' : h.state === 'partial' ? 'INCONCLUSIVA' : 'INVALIDA';
    return {
      id: `live-${box.id}-${h.boot_id}-${h.sequence}`,
      boxId: box.id,
      capturedAt: h.received_at,
      volumeM3: h.occupancy_fraction != null ? h.occupancy_fraction * box.maxVolumeCapacityM3 : null,
      status,
      coverageRatio: h.coverage_fraction ?? null,
      source: 'LIVE_BENCH_SIMULATION'
    };
  }
}
