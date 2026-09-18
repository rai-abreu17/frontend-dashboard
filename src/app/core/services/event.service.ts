import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { OperationalEvent } from '../models/operational-event.model';
import { MOCK_OPERATIONAL_EVENTS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events$ = new BehaviorSubject<OperationalEvent[]>([...MOCK_OPERATIONAL_EVENTS]);

  getAllEvents(): Observable<OperationalEvent[]> {
    return this.events$.asObservable().pipe(
      map(events => [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())),
      delay(250)
    );
  }

  getEventsByBox(boxId: string): Observable<OperationalEvent[]> {
    return this.getAllEvents().pipe(
      map(events => events.filter(e => e.boxId === boxId))
    );
  }
}
