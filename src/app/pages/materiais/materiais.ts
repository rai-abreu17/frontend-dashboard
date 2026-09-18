import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialService } from '../../core/services/material.service';
import { Material } from '../../core/models/material.model';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-materiais',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './materiais.html',
  styleUrl: './materiais.scss'
})
export class Materiais implements OnInit {
  materials$: Observable<Material[]> | undefined;

  constructor(private materialService: MaterialService) {}

  ngOnInit() {
    this.materials$ = this.materialService.getMaterials();
  }
}
