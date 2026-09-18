import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { BoxService } from '../../core/services/box.service';
import { MaterialService } from '../../core/services/material.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { EventService } from '../../core/services/event.service';
import { Box } from '../../core/models/box.model';
import { Material } from '../../core/models/material.model';
import { Measurement } from '../../core/models/measurement.model';
import { OperationalEvent } from '../../core/models/operational-event.model';

interface BoxSummaryRow {
  box: Box;
  material?: Material;
  latestMeasurement?: Measurement;
}

interface BoxHistoryRow {
  occurredAt: string;
  kind: 'Evento' | 'Medição';
  description: string;
}

interface MaterialHistoryRow {
  box: Box;
  firstEventAt: string;
  lastEventAt: string;
  latestVolumeM3?: number;
}

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss'
})
export class Relatorios implements OnInit {
  activeTab: 'resumo' | 'box' | 'material' = 'resumo';

  boxes$: Observable<Box[]> | undefined;
  materials$: Observable<Material[]> | undefined;
  boxSummary$: Observable<BoxSummaryRow[]> | undefined;

  selectedBoxId$ = new BehaviorSubject<string>('');
  boxHistory$: Observable<BoxHistoryRow[]> | undefined;

  selectedMaterialId$ = new BehaviorSubject<string>('');
  materialHistory$: Observable<MaterialHistoryRow[]> | undefined;

  constructor(
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.boxes$ = this.boxService.getBoxes();
    this.materials$ = this.materialService.getMaterials();

    this.boxSummary$ = combineLatest([
      this.boxes$,
      this.materials$,
      this.measurementService.getAllMeasurements()
    ]).pipe(
      map(([boxes, materials, measurements]) => boxes.map(box => ({
        box,
        material: materials.find(m => m.id === box.currentMaterialId),
        latestMeasurement: measurements.find(m => m.boxId === box.id)
      })))
    );

    this.boxHistory$ = combineLatest([
      this.selectedBoxId$,
      this.eventService.getAllEvents(),
      this.measurementService.getAllMeasurements()
    ]).pipe(
      map(([boxId, events, measurements]) => {
        if (!boxId) return [];
        const eventRows: BoxHistoryRow[] = events
          .filter(e => e.boxId === boxId)
          .map(e => ({ occurredAt: e.occurredAt, kind: 'Evento', description: e.description || e.title }));
        const measurementRows: BoxHistoryRow[] = measurements
          .filter(m => m.boxId === boxId)
          .map(m => ({ occurredAt: m.capturedAt, kind: 'Medição', description: `Volume: ${m.volumeM3} m³ (${m.status})` }));
        return [...eventRows, ...measurementRows].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
      })
    );

    this.materialHistory$ = combineLatest([
      this.selectedMaterialId$,
      this.boxes$,
      this.eventService.getAllEvents(),
      this.measurementService.getAllMeasurements()
    ]).pipe(
      map(([materialId, boxes, events, measurements]) => {
        if (!materialId) return [];
        const materialEvents = events.filter(e => e.materialId === materialId);
        const boxIds = Array.from(new Set(materialEvents.map(e => e.boxId)));
        return boxIds
          .map(boxId => {
            const box = boxes.find(b => b.id === boxId);
            if (!box) return undefined;
            const boxEvents = materialEvents.filter(e => e.boxId === boxId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
            const measurement = measurements.find(m => m.boxId === boxId);
            return {
              box,
              firstEventAt: boxEvents[0].occurredAt,
              lastEventAt: boxEvents[boxEvents.length - 1].occurredAt,
              latestVolumeM3: measurement?.volumeM3
            } as MaterialHistoryRow;
          })
          .filter((row): row is MaterialHistoryRow => !!row);
      })
    );
  }

  setTab(tab: 'resumo' | 'box' | 'material') {
    this.activeTab = tab;
  }

  onBoxSelect(event: any) { this.selectedBoxId$.next(event.target.value); }
  onMaterialSelect(event: any) { this.selectedMaterialId$.next(event.target.value); }
}
