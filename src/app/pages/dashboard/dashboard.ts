import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxService } from '../../core/services/box.service';
import { MaterialService } from '../../core/services/material.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { BoxCardComponent } from '../../shared/components/box-card/box-card';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Box } from '../../core/models/box.model';
import { Material } from '../../core/models/material.model';
import { Measurement } from '../../core/models/measurement.model';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

interface BoxViewModel {
  box: Box;
  material?: Material;
  latestMeasurement?: Measurement;
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
  
  selectedPeriod: string = '7d';

  // Mock data for side panels
  pendingAlerts = [
    { title: 'Box 02 - Calibração Necessária', time: 'Há 2h', type: 'calibration' },
    { title: 'Box 07 - Leitura Inválida', time: 'Há 15 min', type: 'danger' }
  ];

  recentActivities = [
    { text: 'Box 03 entrou em Limpeza', time: '10:45', icon: 'check-square' },
    { text: 'Novo material "Soja" em Box 01', time: '09:30', icon: 'package' },
    { text: 'Leitura automática finalizada', time: '09:15', icon: 'history' }
  ];
  
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
    private measurementService: MeasurementService
  ) {}

  ngOnInit() {
    this.viewModels$ = combineLatest([
      this.boxService.getBoxes(),
      this.materialService.getMaterials(),
      this.measurementService.getAllMeasurements()
    ]).pipe(
      map(([boxes, materials, measurements]) => {
        return boxes.map((box, index) => {
          const material = materials.find(m => m.id === box.currentMaterialId);
          const boxMeasurements = measurements.filter(m => m.boxId === box.id);
          boxMeasurements.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
          const latestMeasurement = boxMeasurements.length > 0 ? boxMeasurements[0] : undefined;

          // Mock trend for box card
          const mockTrends = ['+320 m³ nas últimas 2h', '-150 m³ nas últimas 4h', 'Estável', '+50 m³ na última hora'];
          const trend = mockTrends[index % mockTrends.length];

          return {
            box,
            material,
            latestMeasurement,
            trend
          };
        });
      })
    );

    this.viewModels$.subscribe(vms => this.updateOccupationChart(vms));

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
