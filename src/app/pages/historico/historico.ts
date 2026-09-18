import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BoxService } from '../../core/services/box.service';
import { MaterialService } from '../../core/services/material.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { EventService } from '../../core/services/event.service';
import { Box } from '../../core/models/box.model';
import { Material } from '../../core/models/material.model';
import { OperationalEvent } from '../../core/models/operational-event.model';

interface EventViewModel {
  event: OperationalEvent;
  box?: Box;
  material?: Material;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  LEITURA_VOLUMETRICA: 'Leitura volumétrica',
  FALHA_INCONCLUSAO: 'Falha / Inconclusão',
  INICIO_RECEBIMENTO: 'Início de recebimento',
  MUDANCA_ARMAZENADO: 'Alteração para armazenado',
  INICIO_RETIRADA: 'Início de retirada',
  FIM_RETIRADA: 'Fim de retirada',
  INICIO_LIMPEZA: 'Início de limpeza',
  FIM_LIMPEZA: 'Fim de limpeza',
  MATERIAL_ALTERADO: 'Material alterado',
  RECALIBRACAO_SIMULADA: 'Recalibração simulada',
  IMPORTACAO_LEGADO: 'Importação de dado legado',
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  LEITURA_VOLUMETRICA: 'activity',
  FALHA_INCONCLUSAO: 'alert-triangle',
  INICIO_RECEBIMENTO: 'arrow-down',
  MUDANCA_ARMAZENADO: 'box',
  INICIO_RETIRADA: 'arrow-up',
  FIM_RETIRADA: 'arrow-up',
  INICIO_LIMPEZA: 'check-square',
  FIM_LIMPEZA: 'check-square',
  MATERIAL_ALTERADO: 'package',
  RECALIBRACAO_SIMULADA: 'settings',
  IMPORTACAO_LEGADO: 'file-text',
};

const PERIOD_MS: Record<string, number | null> = {
  '1d': 1000 * 60 * 60 * 24,
  '7d': 1000 * 60 * 60 * 24 * 7,
  '30d': 1000 * 60 * 60 * 24 * 30,
  'all': null,
};

@Component({
  selector: 'app-historico',
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './historico.html',
  styleUrl: './historico.scss'
})
export class Historico implements OnInit {
  viewMode: 'timeline' | 'tabela' | 'grafico' = 'timeline';

  periodFilter$ = new BehaviorSubject<string>('7d');
  boxFilter$ = new BehaviorSubject<string>('todos');
  materialFilter$ = new BehaviorSubject<string>('todos');
  typeFilter$ = new BehaviorSubject<string>('todos');
  opStatusFilter$ = new BehaviorSubject<string>('todos');
  measurementStatusFilter$ = new BehaviorSubject<string>('todos');

  boxes$: Observable<Box[]> | undefined;
  materials$: Observable<Material[]> | undefined;
  filteredEvents$: Observable<EventViewModel[]> | undefined;

  volumeChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Volume (m³)', backgroundColor: '#3B82F6', borderRadius: 8 }] };
  volumeChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: '#94A3B8' } }
    }
  };

  readonly eventTypeLabels = EVENT_TYPE_LABELS;
  readonly eventTypeIcons = EVENT_TYPE_ICONS;
  readonly eventTypeOptions = Object.entries(EVENT_TYPE_LABELS);

  constructor(
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.boxes$ = this.boxService.getBoxes();
    this.materials$ = this.materialService.getMaterials();

    const rawEvents$ = combineLatest([
      this.eventService.getAllEvents(),
      this.boxes$,
      this.materials$
    ]).pipe(
      map(([events, boxes, materials]) => events.map(event => ({
        event,
        box: boxes.find(b => b.id === event.boxId),
        material: materials.find(m => m.id === event.materialId)
      })))
    );

    this.filteredEvents$ = combineLatest([
      rawEvents$,
      this.periodFilter$,
      this.boxFilter$,
      this.materialFilter$,
      this.typeFilter$,
      this.opStatusFilter$,
      this.measurementStatusFilter$
    ]).pipe(
      map(([vms, period, boxId, materialId, type, opStatus, measurementStatus]) => {
        let filtered = vms;

        const periodMs = PERIOD_MS[period];
        if (periodMs !== null) {
          const cutoff = Date.now() - periodMs;
          filtered = filtered.filter(vm => new Date(vm.event.occurredAt).getTime() >= cutoff);
        }
        if (boxId !== 'todos') {
          filtered = filtered.filter(vm => vm.event.boxId === boxId);
        }
        if (materialId !== 'todos') {
          filtered = filtered.filter(vm => vm.event.materialId === materialId);
        }
        if (type !== 'todos') {
          filtered = filtered.filter(vm => vm.event.type === type);
        }
        if (opStatus !== 'todos') {
          filtered = filtered.filter(vm => vm.box?.operationalStatus.toLowerCase() === opStatus);
        }
        if (measurementStatus !== 'todos') {
          filtered = filtered.filter(vm => vm.box?.measurementStatus.toLowerCase() === measurementStatus);
        }

        return filtered.sort((a, b) => new Date(b.event.occurredAt).getTime() - new Date(a.event.occurredAt).getTime());
      })
    );

    combineLatest([this.filteredEvents$, this.measurementService.getAllMeasurements()]).subscribe(([vms, measurements]) => {
      const boxIds = Array.from(new Set(vms.map(vm => vm.event.boxId)));
      const points = boxIds
        .map(boxId => {
          const box = vms.find(vm => vm.event.boxId === boxId)?.box;
          const measurement = measurements.find(m => m.boxId === boxId);
          return { code: box?.code ?? boxId, volume: measurement?.volumeM3 ?? 0 };
        })
        .sort((a, b) => b.volume - a.volume);

      this.volumeChartData = {
        labels: points.map(p => p.code),
        datasets: [{ data: points.map(p => p.volume), label: 'Volume (m³)', backgroundColor: '#3B82F6', borderRadius: 8 }]
      };
    });
  }

  setViewMode(mode: 'timeline' | 'tabela' | 'grafico') {
    this.viewMode = mode;
  }

  onPeriodChange(event: any) { this.periodFilter$.next(event.target.value); }
  onBoxChange(event: any) { this.boxFilter$.next(event.target.value); }
  onMaterialChange(event: any) { this.materialFilter$.next(event.target.value); }
  onTypeChange(event: any) { this.typeFilter$.next(event.target.value); }
  onOpStatusChange(event: any) { this.opStatusFilter$.next(event.target.value); }
  onMeasurementStatusChange(event: any) { this.measurementStatusFilter$.next(event.target.value); }
}
