import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ValidationService } from '../../core/services/validation.service';
import { ValidationTest } from '../../core/models/validation-test.model';

@Component({
  selector: 'app-validacao',
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './validacao.html',
  styleUrl: './validacao.scss'
})
export class Validacao implements OnInit {
  tests$: Observable<ValidationTest[]> | undefined;
  expandedTestId: string | null = null;

  repetitionsChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  repetitionsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
      y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: '#94A3B8' } }
    }
  };

  constructor(private validationService: ValidationService) {}

  ngOnInit() {
    this.tests$ = this.validationService.getAll();
  }

  toggleDetail(test: ValidationTest) {
    if (this.expandedTestId === test.id) {
      this.expandedTestId = null;
      return;
    }
    this.expandedTestId = test.id;
    this.repetitionsChartData = {
      labels: test.repetitions.map((_, i) => `Rep. ${i + 1}`),
      datasets: [{
        data: test.repetitions,
        label: 'Volume estimado (m³)',
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6'
      }]
    };
  }
}
