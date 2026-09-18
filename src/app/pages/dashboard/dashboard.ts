import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxService } from '../../core/services/box.service';
import { MaterialService } from '../../core/services/material.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { AcquisitionAttemptService } from '../../core/services/acquisition-attempt.service';
import { EventService } from '../../core/services/event.service';
import { BoxCardComponent } from '../../shared/components/box-card/box-card';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Box } from '../../core/models/box.model';
import { Material } from '../../core/models/material.model';
import { Measurement } from '../../core/models/measurement.model';
import { AcquisitionAttempt } from '../../core/models/operational-event.model';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

const EVENT_ICON_BY_TYPE: Record<string, string> = {
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

function relativeTime(dateIso: string): string {
  const minutes = Math.floor((Date.now() - new Date(dateIso).getTime()) / (1000 * 60));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Há ${days}d`;
}

function computeTrend(measurementsDesc: Measurement[]): string | undefined {
  if (measurementsDesc.length < 2) return undefined;
  const [latest, previous] = measurementsDesc;
  if (latest.volumeM3 == null || previous.volumeM3 == null) return undefined;

  const diff = latest.volumeM3 - previous.volumeM3;
  const hours = (new Date(latest.capturedAt).getTime() - new Date(previous.capturedAt).getTime()) / (1000 * 60 * 60);
  const hoursLabel = hours < 1 ? 'na última hora' : `nas últimas ${Math.round(hours)}h`;

  if (Math.abs(diff) < 20) return 'Estável';
  return `${diff > 0 ? '+' : ''}${Math.round(diff)} m³ ${hoursLabel}`;
}

interface BoxViewModel {
  box: Box;
  material?: Material;
  latestMeasurement?: Measurement;
  latestUnsuccessfulAttempt?: AcquisitionAttempt;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BoxCardComponent, KpiCardComponent, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  viewModels$: Observable<BoxViewModel[]> | undefined;
  kpiStats$: Observable<any> | undefined;
  pendingAlerts$: Observable<{ title: string; time: string; type: 'danger' | 'warning' }[]> | undefined;
  recentActivities$: Observable<{ text: string; time: string; icon: string }[]> | undefined;

  selectedPeriod: string = '7d';

  risksAndPredictions = [
    { box: 'BOX-02', severity: 'danger', title: 'Capacidade crítica em 5h40', confidence: '91%', description: 'Tendência de atingir 90% da capacidade.' },
    { box: 'BOX-05', severity: 'warning', title: 'Ritmo de retirada lento', confidence: '82%', description: '+2h15 em relação à tendência normal.' },
    { box: 'BOX-07', severity: 'warning', title: 'Possível anomalia de leitura', confidence: '72%', description: 'Variação incompatível identificada.' }
  ];
  
  insights = [
    { title: 'Tendência', description: 'O volume armazenado aumentou 18% nos últimos 7 dias.', icon: 'trending-up', color: 'success' },
    { title: 'Operação', description: 'BOX-02 apresenta o maior crescimento de ocupação nas últimas 6h.', icon: 'activity', color: 'primary' },
    { title: 'Eficiência', description: 'Tempo médio entre recebimento e liberação caiu 12%.', icon: 'info', color: 'success' }
  ];

  // Chart: Evolução do Volume (Line Chart)
  public volumeChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg (Prev)', 'Ter (Prev)'],
    datasets: [
      {
        data: [15000, 16500, 16000, 18000, 20000, 22480, 22000, null, null],
        label: 'Volume Realizado',
        fill: true,
        tension: 0.4,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3B82F6',
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        data: [null, null, null, null, null, null, 22000, 23500, 24000],
        label: 'Previsão',
        fill: false,
        tension: 0.4,
        borderColor: '#8B5CF6',
        borderDash: [5, 5],
        pointBackgroundColor: '#8B5CF6',
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  };
  public volumeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.03)', drawTicks: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter' } }
      },
      x: { 
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter' } }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  // Chart: Movimentação (Bar Chart)
  public movementChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      { 
        data: [4000, 3000, 5000, 2000, 6000, 1000, 500], 
        label: 'Entrada', 
        backgroundColor: '#10B981', // premium success
        borderRadius: 8,
        borderSkipped: false
      },
      { 
        data: [2000, 3500, 1000, 4000, 2000, 1500, 1000], 
        label: 'Saída', 
        backgroundColor: '#3B82F6', // premium primary
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };
  public movementChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Inter', size: 12 },
          color: '#64748B'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        stacked: false, 
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter' } }
      },
      y: { 
        stacked: false, 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.03)', drawTicks: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter' } }
      }
    }
  };
  
  // Chart: Ocupação por Box (Horizontal Bar Chart) — populated from real data in ngOnInit
  public occupationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ocupação (%)',
        backgroundColor: [],
        barThickness: 12,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };
  public occupationChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        max: 100, 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.03)', drawTicks: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter' } }
      },
      y: { 
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94A3B8', font: { family: 'Inter', weight: 500 } }
      }
    }
  };

  constructor(
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService,
    private acquisitionAttemptService: AcquisitionAttemptService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.viewModels$ = combineLatest([
      this.boxService.getBoxes(),
      this.materialService.getMaterials(),
      this.measurementService.getAllMeasurements(),
      this.acquisitionAttemptService.getAll()
    ]).pipe(
      map(([boxes, materials, measurements, attempts]) => {
        return boxes.map(box => {
          const material = materials.find(m => m.id === box.currentMaterialId);
          const boxMeasurements = measurements.filter(m => m.boxId === box.id);
          boxMeasurements.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
          const latestMeasurement = boxMeasurements.length > 0 ? boxMeasurements[0] : undefined;

          const latestUnsuccessfulAttempt = attempts
            .filter(a => a.boxId === box.id && a.status !== 'SUCCESS')
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

          const trend = computeTrend(boxMeasurements);

          return {
            box,
            material,
            latestMeasurement,
            latestUnsuccessfulAttempt,
            trend
          };
        });
      })
    );

    this.viewModels$.subscribe(vms => this.updateOccupationChart(vms));

    this.pendingAlerts$ = this.viewModels$.pipe(
      map(vms => vms
        .filter(vm => !!vm.latestUnsuccessfulAttempt)
        .map(vm => ({
          title: `${vm.box.code} - ${vm.latestUnsuccessfulAttempt!.status === 'FAILED' ? 'Leitura Inválida' : 'Não Conclusiva'}`,
          time: relativeTime(vm.latestUnsuccessfulAttempt!.startedAt),
          type: vm.latestUnsuccessfulAttempt!.status === 'FAILED' ? 'danger' as const : 'warning' as const
        }))
      )
    );

    this.recentActivities$ = this.eventService.getAllEvents().pipe(
      map(events => events.slice(0, 5).map(e => ({
        text: e.title,
        time: relativeTime(e.occurredAt),
        icon: EVENT_ICON_BY_TYPE[e.type] ?? 'activity'
      })))
    );

    this.kpiStats$ = this.viewModels$.pipe(
      map(vms => {
        const total = vms.length;
        const valid = vms.filter(vm => vm.latestMeasurement?.status === 'VALIDA').length;
        const attention = vms.filter(vm => vm.latestMeasurement?.status === 'INVALIDA' || vm.latestMeasurement?.status === 'VENCIDA').length;
        const free = vms.filter(vm => vm.box.operationalStatus === 'LIVRE').length;
        const receiving = vms.filter(vm => vm.box.operationalStatus === 'RECEBENDO').length;
        
        // Mocking KPIs for new layout
        return { 
          total, valid, attention, free, receiving,
          volumeTotal: '22.480',
          ocupacaoMedia: '71'
        };
      })
    );
  }
  
  setPeriod(period: string) {
    this.selectedPeriod = period;
    // In a real app, this would fetch new data and update chart datasets.
  }

  private updateOccupationChart(vms: BoxViewModel[]) {
    const palette = ['rgba(239, 68, 68, 0.85)', 'rgba(245, 158, 11, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(6, 182, 212, 0.85)'];

    const topOccupied = vms
      .map(vm => ({
        code: vm.box.code,
        occupancyPercentage: vm.latestMeasurement?.volumeM3 && vm.box.maxVolumeCapacityM3
          ? Math.round((vm.latestMeasurement.volumeM3 / vm.box.maxVolumeCapacityM3) * 100)
          : 0
      }))
      .sort((a, b) => b.occupancyPercentage - a.occupancyPercentage)
      .slice(0, 4);

    this.occupationChartData = {
      labels: topOccupied.map(o => o.code),
      datasets: [{
        data: topOccupied.map(o => o.occupancyPercentage),
        label: 'Ocupação (%)',
        backgroundColor: topOccupied.map((_, i) => palette[i] ?? palette[palette.length - 1]),
        barThickness: 12,
        borderRadius: 6,
        borderSkipped: false
      }]
    };
  }
}
