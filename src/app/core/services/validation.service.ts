import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ValidationTest } from '../models/validation-test.model';
import { MOCK_VALIDATION_TESTS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private tests$ = new BehaviorSubject<ValidationTest[]>([...MOCK_VALIDATION_TESTS]);

  getAll(): Observable<ValidationTest[]> {
    return this.tests$.asObservable().pipe(delay(250));
  }
}
