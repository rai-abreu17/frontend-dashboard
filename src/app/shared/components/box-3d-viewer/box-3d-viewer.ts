import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box } from '../../../core/models/box.model';
import { Measurement } from '../../../core/models/measurement.model';

interface TimelinePoint {
  volumeM3: number;
  label: string;
}

@Component({
  selector: 'app-box-3d-viewer',
  imports: [CommonModule],
  templateUrl: './box-3d-viewer.html',
  styleUrl: './box-3d-viewer.scss'
})
export class Box3dViewerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() box!: Box;
  @Input() measurements: Measurement[] = [];
  @Input() materialColor?: string;

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  hasData = false;
  sliderValue = 100;
  currentLabel = '';
  currentVolumeM3 = 0;

  private timeline: TimelinePoint[] = [];
  private viewInitialized = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private pileMesh?: THREE.Mesh;
  private frameId?: number;
  private footprintRadius = 5;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.buildTimeline();
    this.initScene();
    this.updatePileForSlider();
    this.animate();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvasRef.nativeElement);
  }

  private handleResize() {
    if (!this.renderer || !this.camera) return;
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.viewInitialized && (changes['measurements'] || changes['box'])) {
      this.buildTimeline();
      this.updatePileForSlider();
    }
  }

  ngOnDestroy() {
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach(m => m.dispose());
      }
    });
  }

  onSliderInput(event: Event) {
    this.sliderValue = Number((event.target as HTMLInputElement).value);
    this.updatePileForSlider();
  }

  private buildTimeline() {
    const sorted = [...this.measurements].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    this.hasData = sorted.length > 0;
    if (!this.hasData) {
      this.timeline = [];
      return;
    }
    const points: TimelinePoint[] = [{ volumeM3: 0, label: 'Início (vazio)' }];
    for (const m of sorted) {
      points.push({
        volumeM3: m.volumeM3 ?? 0,
        label: new Date(m.capturedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      });
    }
    this.timeline = points;
    this.sliderValue = 100;
  }

  private volumeAtProgress(progress: number): TimelinePoint {
    if (this.timeline.length === 0) return { volumeM3: 0, label: '' };
    if (this.timeline.length === 1) return this.timeline[0];

    const totalSpan = this.timeline.length - 1;
    const pos = (progress / 100) * totalSpan;
    const idx = Math.min(Math.floor(pos), totalSpan - 1);
    const frac = pos - idx;
    const a = this.timeline[idx];
    const b = this.timeline[idx + 1];
    return {
      volumeM3: a.volumeM3 + (b.volumeM3 - a.volumeM3) * frac,
      label: frac < 0.5 ? a.label : b.label
    };
  }

  private updatePileForSlider() {
    const point = this.volumeAtProgress(this.sliderValue);
    this.currentVolumeM3 = point.volumeM3;
    this.currentLabel = point.label;
    this.renderPileVolume(point.volumeM3);
  }

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 320;

    const boxWidth = this.box.widthM;
    const boxLength = this.box.lengthM;
    const wallHeight = 8;
    const maxDim = Math.max(boxWidth, boxLength);
    this.footprintRadius = (Math.min(boxWidth, boxLength) / 2) * 0.85;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#F1F5F9');

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(maxDim * 0.5, maxDim * 0.45, maxDim * 0.6);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = maxDim * 0.25;
    this.controls.maxDistance = maxDim * 1.4;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.target.set(0, wallHeight * 0.2, 0);

    const floorGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const wallsGeo = new THREE.BoxGeometry(boxWidth, wallHeight, boxLength);
    const edges = new THREE.EdgesGeometry(wallsGeo);
    const wallLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#94A3B8' }));
    wallLines.position.y = wallHeight / 2;
    this.scene.add(wallLines);

    this.scene.add(new THREE.AmbientLight('#FFFFFF', 0.7));
    const dirLight = new THREE.DirectionalLight('#FFFFFF', 0.9);
    dirLight.position.set(maxDim * 0.4, maxDim * 0.8, maxDim * 0.3);
    this.scene.add(dirLight);

    const pileGeo = new THREE.ConeGeometry(0.01, 0.01, 32);
    const pileMat = new THREE.MeshStandardMaterial({ color: this.materialColor || '#3B82F6' });
    this.pileMesh = new THREE.Mesh(pileGeo, pileMat);
    this.scene.add(this.pileMesh);
  }

  private renderPileVolume(volumeM3: number) {
    if (!this.pileMesh) return;

    // Cone de repouso: V = (1/3) * pi * r^2 * h, com h ~= 0.8 * r (ângulo de repouso aproximado)
    let r = Math.cbrt((3 * Math.max(volumeM3, 0)) / (Math.PI * 0.8));
    r = Math.min(r, this.footprintRadius);
    const h = Math.max(r * 0.8, 0.05);

    this.pileMesh.geometry.dispose();
    this.pileMesh.geometry = new THREE.ConeGeometry(Math.max(r, 0.05), h, 32);
    this.pileMesh.position.y = h / 2;
  }

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
