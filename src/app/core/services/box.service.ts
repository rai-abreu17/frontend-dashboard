import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Box } from '../models/box.model';
import { MOCK_BOXES } from './mock-data';
import { OperationalStatus, MeasurementStatus } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private boxes$ = new BehaviorSubject<Box[]>([...MOCK_BOXES]);

  constructor() { }

  getBoxes(): Observable<Box[]> {
    return this.boxes$.asObservable().pipe(delay(400));
  }

  getBoxById(id: string): Observable<Box | undefined> {
    return this.boxes$.pipe(
      map(boxes => boxes.find(b => b.id === id)),
      delay(200)
    );
  }

  updateOperationalStatus(boxId: string, status: OperationalStatus, materialId?: string | null): Observable<boolean> {
    const currentBoxes = this.boxes$.getValue();
    const boxIndex = currentBoxes.findIndex(b => b.id === boxId);
    
    if (boxIndex > -1) {
      const updatedBoxes = [...currentBoxes];
      const box = { ...updatedBoxes[boxIndex] };
      
      box.operationalStatus = status;
      if (materialId !== undefined) {
        if (box.currentMaterialId && materialId === null) {
          box.lastMaterialId = box.currentMaterialId;
        }
        box.currentMaterialId = materialId;
      }
      
      updatedBoxes[boxIndex] = box;
      this.boxes$.next(updatedBoxes);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}
