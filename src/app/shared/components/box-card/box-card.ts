import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Box } from '../../../core/models/box.model';
import { Measurement } from '../../../core/models/measurement.model';
import { Material } from '../../../core/models/material.model';
import { StatusBadgeComponent } from '../status-badge/status-badge';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-box-card',
  imports: [CommonModule, StatusBadgeComponent, LucideAngularModule],
  templateUrl: './box-card.html',
  styleUrl: './box-card.scss',
  providers: [DatePipe]
})
export class BoxCardComponent {
  @Input() box!: Box;
  @Input() material?: Material;
  @Input() latestMeasurement?: Measurement;
  @Input() latestAttemptFailed?: boolean;
  @Input() trend?: string; // e.g. "+320 m³ nas últimas 2h"
  
  get occupancyPercentage(): number {
    if (!this.latestMeasurement?.volumeM3 || !this.box?.maxVolumeCapacityM3) return 0;
    return Math.round((this.latestMeasurement.volumeM3 / this.box.maxVolumeCapacityM3) * 100);
  }
}
