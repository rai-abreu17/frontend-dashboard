import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BoxService } from '../../../core/services/box.service';
import { MaterialService } from '../../../core/services/material.service';
import { MeasurementService } from '../../../core/services/measurement.service';
import { Box } from '../../../core/models/box.model';
import { Material } from '../../../core/models/material.model';
import { Measurement } from '../../../core/models/measurement.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { LucideAngularModule } from 'lucide-angular';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface BoxDetailViewModel {
  box: Box;
  material?: Material;
  measurements: Measurement[];
  latestMeasurement?: Measurement;
}

@Component({
  selector: 'app-box-detail',
  imports: [CommonModule, StatusBadgeComponent, LucideAngularModule],
  templateUrl: './box-detail.html',
  styleUrl: './box-detail.scss'
})
export class BoxDetail implements OnInit {
  viewModel$: Observable<BoxDetailViewModel | undefined> | undefined;
  activeTab = 'geral';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService
  ) {}

  ngOnInit() {
    this.viewModel$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return [undefined];
        
        return combineLatest([
          this.boxService.getBoxById(id),
          this.materialService.getMaterials(),
          this.measurementService.getMeasurementsByBox(id)
        ]).pipe(
          map(([box, materials, measurements]) => {
            if (!box) return undefined;
            const material = materials.find(m => m.id === box.currentMaterialId);
            const latestMeasurement = measurements.length > 0 ? measurements[0] : undefined;
            return { box, material, measurements, latestMeasurement };
          })
        );
      })
    );
  }

  goBack() {
    this.location.back();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
