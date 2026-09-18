import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Measurement } from '../models/measurement.model';
import { MOCK_MEASUREMENTS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private measurements$ = new BehaviorSubject<Measurement[]>([...MOCK_MEASUREMENTS]);

  constructor() { }

  getMeasurementsByBox(boxId: string): Observable<Measurement[]> {
    return this.measurements$.pipe(
      map(meas => meas.filter(m => m.boxId === boxId).sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())),
      delay(300)
    );
  }

  getLatestMeasurement(boxId: string): Observable<Measurement | undefined> {
    return this.getMeasurementsByBox(boxId).pipe(
      map(meas => meas.length > 0 ? meas[0] : undefined)
    );
  }

  getAllMeasurements(): Observable<Measurement[]> {
    return this.measurements$.asObservable().pipe(delay(200));
  }
}
