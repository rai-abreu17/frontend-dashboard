import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BoxService } from '../../../core/services/box.service';
import { MaterialService } from '../../../core/services/material.service';
import { MeasurementService } from '../../../core/services/measurement.service';
import { EventService } from '../../../core/services/event.service';
import { AcquisitionAttemptService } from '../../../core/services/acquisition-attempt.service';
import { Box } from '../../../core/models/box.model';
import { Material } from '../../../core/models/material.model';
import { Measurement } from '../../../core/models/measurement.model';
import { OperationalEvent, AcquisitionAttempt } from '../../../core/models/operational-event.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { Box3dViewerComponent } from '../../../shared/components/box-3d-viewer/box-3d-viewer';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface BoxDetailViewModel {
  box: Box;
  material?: Material;
  measurements: Measurement[];
  latestMeasurement?: Measurement;
  rejectedAttempts: AcquisitionAttempt[];
}

interface HistoryRow {
  occurredAt: string;
  kind: 'Evento' | 'Medição';
  description: string;
}

@Component({
  selector: 'app-box-detail',
  imports: [CommonModule, StatusBadgeComponent, Box3dViewerComponent, LucideAngularModule, BaseChartDirective],
  templateUrl: './box-detail.html',
  styleUrl: './box-detail.scss'
})
export class BoxDetail implements OnInit {
  viewModel$: Observable<BoxDetailViewModel | undefined> | undefined;
  activeTab = 'geral';

  historyRows: HistoryRow[] = [];

  volumeTrendChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  volumeTrendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: '#94A3B8' } }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService,
    private eventService: EventService,
    private acquisitionAttemptService: AcquisitionAttemptService
  ) {}

  ngOnInit() {
    this.viewModel$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return [undefined];

        return combineLatest([
          this.boxService.getBoxById(id),
          this.materialService.getMaterials(),
          this.measurementService.getMeasurementsByBox(id),
          this.acquisitionAttemptService.getByBox(id),
          this.eventService.getEventsByBox(id)
        ]).pipe(
          map(([box, materials, measurements, attempts, events]) => {
            if (!box) return undefined;
            const material = materials.find(m => m.id === box.currentMaterialId);
            const latestMeasurement = measurements.length > 0 ? measurements[0] : undefined;
            const rejectedAttempts = attempts.filter(a => a.status !== 'SUCCESS');

            this.buildHistoryRows(measurements, events);
            this.buildTrendChart(measurements);

            return { box, material, measurements, latestMeasurement, rejectedAttempts };
          })
        );
      })
    );
  }

  private buildHistoryRows(measurements: Measurement[], events: OperationalEvent[]) {
    const eventRows: HistoryRow[] = events.map(e => ({ occurredAt: e.occurredAt, kind: 'Evento', description: e.description || e.title }));
    const measurementRows: HistoryRow[] = measurements.map(m => ({
      occurredAt: m.capturedAt,
      kind: 'Medição',
      description: `Volume: ${m.volumeM3 ?? '--'} m³ (${m.status})`
    }));
    this.historyRows = [...eventRows, ...measurementRows].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  private buildTrendChart(measurements: Measurement[]) {
    const chronological = [...measurements].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    this.volumeTrendChartData = {
      labels: chronological.map(m => new Date(m.capturedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })),
      datasets: [{
        data: chronological.map(m => m.volumeM3 ?? 0),
        label: 'Volume (m³)',
        fill: true,
        tension: 0.4,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3B82F6'
      }]
    };
  }

  goBack() {
    this.location.back();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  regionCells(measurement: Measurement | undefined): boolean[] {
    const total = 60;
    const coverage = measurement?.coverageRatio ?? 0;
    const observed = Math.round(coverage * total);
    return Array.from({ length: total }, (_, i) => i < observed);
  }
}
