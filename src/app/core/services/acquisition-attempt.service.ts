import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AcquisitionAttempt } from '../models/operational-event.model';
import { MOCK_ACQUISITION_ATTEMPTS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class AcquisitionAttemptService {
  private attempts$ = new BehaviorSubject<AcquisitionAttempt[]>([...MOCK_ACQUISITION_ATTEMPTS]);

  getAll(): Observable<AcquisitionAttempt[]> {
    return this.attempts$.asObservable().pipe(delay(250));
  }

  getByBox(boxId: string): Observable<AcquisitionAttempt[]> {
    return this.getAll().pipe(
      map(attempts => attempts
        .filter(a => a.boxId === boxId)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()))
    );
  }

  /** Tentativa mais recente que não teve sucesso (falha ou inconclusiva) para o box, se houver. */
  getLatestUnsuccessfulByBox(boxId: string): Observable<AcquisitionAttempt | undefined> {
    return this.getByBox(boxId).pipe(
      map(attempts => attempts.find(a => a.status !== 'SUCCESS'))
    );
  }
}
