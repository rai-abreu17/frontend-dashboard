import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Material } from '../models/material.model';
import { MOCK_MATERIALS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private materials$ = new BehaviorSubject<Material[]>([...MOCK_MATERIALS]);

  constructor() { }

  getMaterials(): Observable<Material[]> {
    return this.materials$.asObservable().pipe(delay(300));
  }

  getMaterialById(id: string): Observable<Material | undefined> {
    return this.materials$.pipe(
      map(mats => mats.find(m => m.id === id)),
      delay(150)
    );
  }
}
