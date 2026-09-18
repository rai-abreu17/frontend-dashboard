import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BoxService } from '../../core/services/box.service';
import { MaterialService } from '../../core/services/material.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { BoxCardComponent } from '../../shared/components/box-card/box-card';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Box } from '../../core/models/box.model';
import { Material } from '../../core/models/material.model';
import { Measurement } from '../../core/models/measurement.model';
import { LucideAngularModule } from 'lucide-angular';

interface BoxViewModel {
  box: Box;
  material?: Material;
  latestMeasurement?: Measurement;
}

@Component({
  selector: 'app-boxes',
  imports: [CommonModule, FormsModule, RouterLink, BoxCardComponent, LucideAngularModule],
  templateUrl: './boxes.html',
  styleUrl: './boxes.scss'
})
export class Boxes implements OnInit {
  viewModels$: Observable<BoxViewModel[]> | undefined;
  
  searchTerm$ = new BehaviorSubject<string>('');
  statusFilter$ = new BehaviorSubject<string>('todos');

  constructor(
    private boxService: BoxService,
    private materialService: MaterialService,
    private measurementService: MeasurementService
  ) {}

  ngOnInit() {
    const rawData$ = combineLatest([
      this.boxService.getBoxes(),
      this.materialService.getMaterials(),
      this.measurementService.getAllMeasurements()
    ]).pipe(
      map(([boxes, materials, measurements]) => {
        return boxes.map(box => {
          const material = materials.find(m => m.id === box.currentMaterialId);
          const boxMeasurements = measurements.filter(m => m.boxId === box.id);
          boxMeasurements.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
          const latestMeasurement = boxMeasurements.length > 0 ? boxMeasurements[0] : undefined;
          return { box, material, latestMeasurement };
        });
      })
    );

    this.viewModels$ = combineLatest([
      rawData$,
      this.searchTerm$,
      this.statusFilter$
    ]).pipe(
      map(([vms, search, status]) => {
        let filtered = vms;
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(vm => 
            vm.box.code.toLowerCase().includes(s) || 
            (vm.material?.name.toLowerCase().includes(s))
          );
        }
        if (status && status !== 'todos') {
          filtered = filtered.filter(vm => vm.box.operationalStatus.toLowerCase() === status);
        }
        return filtered;
      })
    );
  }

  onSearch(event: any) {
    this.searchTerm$.next(event.target.value);
  }

  onStatusChange(event: any) {
    this.statusFilter$.next(event.target.value);
  }
}
