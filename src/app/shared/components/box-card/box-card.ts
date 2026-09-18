import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Box } from '../../../core/models/box.model';
import { Measurement } from '../../../core/models/measurement.model';
import { Material } from '../../../core/models/material.model';
import { AcquisitionAttempt } from '../../../core/models/operational-event.model';
import { StatusBadgeComponent } from '../status-badge/status-badge';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-box-card',
  imports: [CommonModule, RouterLink, StatusBadgeComponent, LucideAngularModule],
  templateUrl: './box-card.html',
  styleUrl: './box-card.scss',
  providers: [DatePipe]
})
export class BoxCardComponent {
  @Input() box!: Box;
  @Input() material?: Material;
  @Input() latestMeasurement?: Measurement;
  @Input() latestUnsuccessfulAttempt?: AcquisitionAttempt;
  @Input() trend?: string; // e.g. "+320 m³ nas últimas 2h"
  
  get occupancyPercentage(): number {
    if (!this.latestMeasurement?.volumeM3 || !this.box?.maxVolumeCapacityM3) return 0;
    return Math.round((this.latestMeasurement.volumeM3 / this.box.maxVolumeCapacityM3) * 100);
  }

  get availableCapacityM3(): number | null {
    if (this.latestMeasurement?.volumeM3 == null || !this.box?.maxVolumeCapacityM3) return null;
    return Math.max(0, this.box.maxVolumeCapacityM3 - this.latestMeasurement.volumeM3);
  }

  get readingAge(): string | null {
    if (!this.latestMeasurement?.capturedAt) return null;
    const diffMs = Date.now() - new Date(this.latestMeasurement.capturedAt).getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
  }

  get coveragePct(): number | null {
    if (this.latestMeasurement?.coverageRatio == null) return null;
    return Math.round(this.latestMeasurement.coverageRatio * 100);
  }
}
