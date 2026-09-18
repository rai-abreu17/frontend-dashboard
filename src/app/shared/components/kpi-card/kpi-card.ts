import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-kpi-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss'
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() description?: string;
  @Input() highlight?: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
  
  // Novos inputs para tendência
  @Input() trendValue?: string;
  @Input() trendDirection?: 'up' | 'down' | 'neutral';
}
