import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box } from '../../../core/models/box.model';
import { Measurement } from '../../../core/models/measurement.model';

interface TimelinePoint {
  volumeM3: number;
  label: string;
}

/**
 * Matriz de alturas [linha][coluna] em metros, alinhada a uma grade regular sobre
 * o piso do box (linha = eixo comprimento/Z, coluna = eixo largura/X). Hoje é
 * gerada de forma sintética a partir do volume (`heightMatrixFromVolume`); no
 * futuro pode ser substituída por uma matriz vinda de um sensor/LiDAR real sem
 * tocar em `buildSurfaceGeometry`, que só depende deste formato.
 */
type HeightMatrix = number[][];

const GRID_COLS = 48; // eixo largura (X)
const GRID_ROWS = 64; // eixo comprimento (Z), mais subdivisões por ser o eixo mais longo
const WALL_THICKNESS = 0.4;
const DEFAULT_MATERIAL_COLOR = '#AD5C3A'; // terracota/minério seco, tom padrão de material granular a granel

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

  // Signals: em uma app com change detection zoneless, mutações de campos comuns
  // dentro de ngAfterViewInit/eventos nativos do canvas não são garantidas de
  // reabrir uma nova verificação — signals notificam o template diretamente.
  hasData = signal(false);
  sliderValue = signal(100);
  currentLabel = signal('');
  currentVolumeM3 = signal(0);

  private timeline: TimelinePoint[] = [];
  private viewInitialized = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private pileMesh?: THREE.Mesh;
  private pileMaterial?: THREE.MeshStandardMaterial;
  private frameId?: number;
  private resizeObserver?: ResizeObserver;
  private seed = 1;

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.buildTimeline();
    this.initScene();
    this.updatePileForSlider();
    this.animate();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvasRef.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.viewInitialized && (changes['measurements'] || changes['box'])) {
      this.buildTimeline();
      this.updatePileForSlider();
    }
    if (this.viewInitialized && changes['materialColor'] && this.pileMaterial) {
      const color = this.materialColor || DEFAULT_MATERIAL_COLOR;
      this.pileMaterial.color = new THREE.Color(color);
      this.pileMaterial.map?.dispose();
      this.pileMaterial.bumpMap?.dispose();
      const texture = createCrackedTerracottaTexture(color);
      texture.repeat.set(Math.max(2, Math.round(this.box.widthM / 6)), Math.max(4, Math.round(this.box.lengthM / 6)));
      this.pileMaterial.map = texture;
      this.pileMaterial.bumpMap = texture;
      this.pileMaterial.needsUpdate = true;
    }
  }

  ngOnDestroy() {
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene?.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Sprite) {
        obj.geometry?.dispose?.();
        const material = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (material) {
          const materials = Array.isArray(material) ? material : [material];
          materials.forEach(m => {
            const withMaps = m as THREE.MeshStandardMaterial;
            withMaps.map?.dispose?.();
            withMaps.bumpMap?.dispose?.();
            m.dispose();
          });
        }
      }
    });
  }

  onSliderInput(event: Event) {
    this.sliderValue.set(Number((event.target as HTMLInputElement).value));
    this.updatePileForSlider();
  }

  // ---------------------------------------------------------------------------
  // Timeline / scrubber (inalterado na lógica: ponto sintético vazio + medições
  // reais em ordem cronológica, interpoladas linearmente pelo slider).
  // ---------------------------------------------------------------------------

  private buildTimeline() {
    const sorted = [...this.measurements].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    const hasData = sorted.length > 0;
    this.hasData.set(hasData);
    if (!hasData) {
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
    this.sliderValue.set(100);
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
    const point = this.volumeAtProgress(this.sliderValue());
    this.currentVolumeM3.set(point.volumeM3);
    this.currentLabel.set(point.label);
    this.renderPileVolume(point.volumeM3);
  }

  // ---------------------------------------------------------------------------
  // Cena: estrutura industrial (piso, paredes, cobertura simplificada, réguas de
  // altura) + a massa granular como heightfield sobre o piso.
  // ---------------------------------------------------------------------------

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 320;

    const boxWidth = this.box.widthM;
    const boxLength = this.box.lengthM;
    const wallHeight = this.box.heightM;
    const roofHeight = wallHeight + 2.5;
    this.seed = hashStringToInt(this.box.id || this.box.code || 'box');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#E7ECEF');
    this.scene.fog = new THREE.Fog('#E7ECEF', boxLength * 1.4, boxLength * 3.2);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 500);
    this.camera.position.set(boxWidth * 0.85, wallHeight * 1.3, boxLength * 0.58);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = wallHeight * 1.2;
    this.controls.maxDistance = boxLength * 1.9;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.target.set(0, wallHeight * 0.28, 0);
    this.camera.lookAt(this.controls.target);

    this.buildLighting(boxWidth, boxLength, wallHeight);
    this.buildFloor(boxWidth, boxLength);
    this.buildWalls(boxWidth, boxLength, wallHeight);
    this.buildRoofContext(boxWidth, boxLength, wallHeight, roofHeight);
    this.buildHeightMarkers(boxWidth, boxLength, wallHeight);
    this.buildScaleFigure(boxWidth, boxLength);

    const pileColor = this.materialColor || DEFAULT_MATERIAL_COLOR;
    const pileTexture = createCrackedTerracottaTexture(pileColor);
    pileTexture.repeat.set(Math.max(2, Math.round(boxWidth / 6)), Math.max(4, Math.round(boxLength / 6)));
    this.pileMaterial = new THREE.MeshStandardMaterial({
      color: pileColor,
      roughness: 0.96,
      metalness: 0,
      vertexColors: true,
      map: pileTexture,
      bumpMap: pileTexture,
      bumpScale: 0.12
    });
    this.pileMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.pileMaterial);
    this.pileMesh.castShadow = true;
    this.pileMesh.receiveShadow = true;
    this.scene.add(this.pileMesh);
  }

  private buildLighting(boxWidth: number, boxLength: number, wallHeight: number) {
    this.scene.add(new THREE.HemisphereLight('#E8DFD3', '#5A5348', 0.38));
    this.scene.add(new THREE.AmbientLight('#FFFFFF', 0.22));

    const sun = new THREE.DirectionalLight('#FFF3E2', 1.3);
    sun.position.set(boxWidth * 0.6, wallHeight * 2.6, boxLength * 0.35);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const shadowSpan = Math.max(boxWidth, boxLength) * 0.75;
    sun.shadow.camera.left = -shadowSpan;
    sun.shadow.camera.right = shadowSpan;
    sun.shadow.camera.top = shadowSpan;
    sun.shadow.camera.bottom = -shadowSpan;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = wallHeight * 8;
    sun.shadow.bias = -0.0015;
    this.scene.add(sun);

    // Luz de preenchimento suave do lado oposto, só para o lado de sombra não ficar preto.
    const fill = new THREE.DirectionalLight('#DCE6EE', 0.22);
    fill.position.set(-boxWidth * 0.5, wallHeight * 1.2, -boxLength * 0.2);
    this.scene.add(fill);
  }

  private buildFloor(boxWidth: number, boxLength: number) {
    const apron = 4;
    const floorGeo = new THREE.PlaneGeometry(boxWidth + WALL_THICKNESS * 2, boxLength + apron);
    const floorTexture = createStainedConcreteTexture('#8F867A', '#6B5A4C', false);
    floorTexture.repeat.set(Math.max(2, Math.round(boxWidth / 2)), Math.max(2, Math.round((boxLength + apron) / 2)));
    const floorMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: floorTexture, roughness: 1, metalness: 0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = apron / 2 - WALL_THICKNESS;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  private buildWalls(boxWidth: number, boxLength: number, wallHeight: number) {
    const wallTexture = createStainedConcreteTexture('#C7A98F', '#8B4A35', true);
    wallTexture.repeat.set(6, 3);
    const wallMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: wallTexture, roughness: 0.92, metalness: 0.02 });
    const halfW = boxWidth / 2;
    const halfL = boxLength / 2;

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICKNESS, wallHeight, boxLength), wallMat);
    leftWall.position.set(-(halfW + WALL_THICKNESS / 2), wallHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = halfW + WALL_THICKNESS / 2;
    this.scene.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + WALL_THICKNESS * 2, wallHeight, WALL_THICKNESS), wallMat);
    backWall.position.set(0, wallHeight / 2, -(halfL + WALL_THICKNESS / 2));
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.scene.add(backWall);
  }

  private buildRoofContext(boxWidth: number, boxLength: number, wallHeight: number, roofHeight: number) {
    const structureMat = new THREE.MeshStandardMaterial({ color: '#8B9096', roughness: 0.8, metalness: 0.1 });
    const halfW = boxWidth / 2 + WALL_THICKNESS;
    const halfL = boxLength / 2 + WALL_THICKNESS;
    const pillarGeo = new THREE.CylinderGeometry(0.22, 0.22, roofHeight, 10);

    const corners: Array<[number, number]> = [
      [-halfW, -halfL],
      [halfW, -halfL],
      [-halfW, halfL],
      [halfW, halfL]
    ];
    for (const [x, z] of corners) {
      const pillar = new THREE.Mesh(pillarGeo, structureMat);
      pillar.position.set(x, roofHeight / 2, z);
      pillar.castShadow = true;
      this.scene.add(pillar);
    }

    const beamGeo = new THREE.BoxGeometry(0.25, 0.25, boxLength + WALL_THICKNESS * 2);
    const leftBeam = new THREE.Mesh(beamGeo, structureMat);
    leftBeam.position.set(-halfW, wallHeight, 0);
    this.scene.add(leftBeam);
    const rightBeam = leftBeam.clone();
    rightBeam.position.x = halfW;
    this.scene.add(rightBeam);

    const roofGeo = new THREE.PlaneGeometry(boxWidth + WALL_THICKNESS * 2 + 1, boxLength + WALL_THICKNESS * 2 + 1);
    const roofMat = new THREE.MeshBasicMaterial({ color: '#8B9096', transparent: true, opacity: 0.22, side: THREE.DoubleSide });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = roofHeight;
    this.scene.add(roof);
  }

  private buildHeightMarkers(boxWidth: number, boxLength: number, wallHeight: number) {
    const halfW = boxWidth / 2;
    const halfL = boxLength / 2;
    const tickMat = new THREE.LineBasicMaterial({ color: '#4B5563' });
    const step = wallHeight > 10 ? 2 : 1;

    for (let h = step; h < wallHeight; h += step) {
      const points = [
        new THREE.Vector3(-halfW + 0.3, h, -halfL + WALL_THICKNESS / 2 + 0.02),
        new THREE.Vector3(halfW * -0.55, h, -halfL + WALL_THICKNESS / 2 + 0.02)
      ];
      const tickGeo = new THREE.BufferGeometry().setFromPoints(points);
      this.scene.add(new THREE.LineSegments(tickGeo, tickMat));

      const label = this.createTextSprite(`${h}m`);
      label.position.set(-halfW + 0.9, h + 0.05, -halfL + WALL_THICKNESS / 2 + 0.03);
      this.scene.add(label);
    }
  }

  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(1, 0.5, 1);
    return sprite;
  }

  private buildScaleFigure(boxWidth: number, boxLength: number) {
    const figure = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.95, 4, 8), skin);
    body.position.y = 0.18 + 0.475;
    body.castShadow = true;
    figure.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), skin);
    head.position.y = 0.18 + 0.95 + 0.13;
    head.castShadow = true;
    figure.add(head);

    figure.position.set(-boxWidth / 2 + 1.1, 0, boxLength / 2 - 1.6);
    this.scene.add(figure);
  }

  // ---------------------------------------------------------------------------
  // Massa granular: gera uma matriz de alturas sintética a partir do volume
  // atual e a converte em uma malha triangulada (heightfield).
  // ---------------------------------------------------------------------------

  private renderPileVolume(volumeM3: number) {
    if (!this.pileMesh) return;

    const boxWidth = this.box.widthM;
    const boxLength = this.box.lengthM;
    const wallHeight = this.box.heightM;
    const fillRatio = Math.max(0, Math.min(1, volumeM3 / this.box.maxVolumeCapacityM3));

    const matrix = heightMatrixFromVolume(fillRatio, boxWidth, boxLength, wallHeight, this.seed, GRID_COLS, GRID_ROWS);
    const geometry = buildSurfaceGeometry(matrix, boxWidth, boxLength);

    this.pileMesh.geometry.dispose();
    this.pileMesh.geometry = geometry;
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

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}

// =============================================================================
// Funções puras de geração de dados/malha — não dependem de Angular nem de
// estado do componente, para que a fonte da matriz de alturas (hoje sintética)
// possa ser substituída por dados reais de sensor/LiDAR no futuro sem alterar
// `buildSurfaceGeometry`.
// =============================================================================

function hashStringToInt(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hash2(x: number, y: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function valueNoise2D(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const topLeft = hash2(xi, yi);
  const topRight = hash2(xi + 1, yi);
  const bottomLeft = hash2(xi, yi + 1);
  const bottomRight = hash2(xi + 1, yi + 1);
  const u = smoothstep(xf);
  const v = smoothstep(yf);
  return lerp(lerp(topLeft, topRight, u), lerp(bottomLeft, bottomRight, u), v);
}

/**
 * Gera uma matriz de alturas sintética representando uma massa granular
 * irregular acumulada por gravidade dentro do box, a partir da fração de
 * preenchimento (volume atual / capacidade). Simula descargas sucessivas
 * formando montes que crescem, se espalham e eventualmente se fundem e
 * encostam nas paredes conforme o preenchimento aumenta.
 */
function heightMatrixFromVolume(
  fillRatio: number,
  boxWidth: number,
  boxLength: number,
  wallHeight: number,
  seed: number,
  cols: number,
  rows: number
): HeightMatrix {
  const matrix: HeightMatrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
  if (fillRatio <= 0) return matrix;

  const minDim = Math.min(boxWidth, boxLength);

  // Até 3 montes de descarga, nascendo em instantes escalonados de fillRatio
  // para simular sucessivas cargas caindo no mesmo ponto central e se espalhando.
  const blobs = [0, 1, 2].map(k => {
    const bx = seed + k * 17.31;
    const u = 0.5 + (seededRandom(bx) - 0.5) * 0.5; // posição ao longo da largura (0..1)
    const v = 0.3 + seededRandom(bx + 3.7) * 0.5; // posição ao longo do comprimento (0..1), levemente puxado p/ fundo
    const weight = smoothstep((fillRatio - k * 0.14) / 0.42);
    const baseRadius = (0.22 + seededRandom(bx + 7.1) * 0.12) * minDim;
    const radius = baseRadius * (0.45 + 1.45 * weight);
    return { u, v, weight, radius };
  });

  // Cobertura de fundo: em preenchimentos altos, uma camada rasa se espalha por
  // quase todo o piso (o material passa a "usar" toda a largura/comprimento).
  const ambientBase = smoothstep((fillRatio - 0.55) / 0.4) * 0.18;

  // Altura máxima aproximada da massa: sobe rápido no início (monte já visível com
  // pouco material) e desacelera ao se aproximar do topo da parede, sempre abaixo dela.
  const peakHeight = wallHeight * 0.8 * Math.pow(fillRatio, 0.6);

  for (let j = 0; j < rows; j++) {
    const v = j / (rows - 1);
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);

      let combined = ambientBase;
      let sumCubed = Math.pow(ambientBase, 3);
      for (const blob of blobs) {
        if (blob.weight <= 0) continue;
        const dx = (u - blob.u) * boxWidth;
        const dz = (v - blob.v) * boxLength;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const t = dist / blob.radius;
        const shape = Math.pow(Math.max(0, 1 - t * t), 1.4);
        const contribution = blob.weight * shape;
        sumCubed += Math.pow(contribution, 3);
      }
      combined = Math.cbrt(sumCubed);

      // Ondulação suave de grande escala apenas — o detalhe fino de superfície
      // (rachaduras/textura) vem do bump map do material, não da geometria.
      const noise = valueNoise2D(u * 5 + seed * 0.01, v * 5 + seed * 0.01) - 0.5;
      const mask = Math.max(0, combined * (1 + noise * 0.09));
      matrix[j][i] = Math.min(wallHeight * 0.9, mask * peakHeight);
    }
  }

  return matrix;
}

/**
 * Converte uma matriz de alturas em uma malha triangulada plana em XZ com Y
 * como altura, com pequenas variações de cor por vértice para sugerir textura
 * granular. Não depende de como a matriz foi obtida.
 */
function buildSurfaceGeometry(matrix: HeightMatrix, boxWidth: number, boxLength: number): THREE.BufferGeometry {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const positions = new Float32Array(rows * cols * 3);
  const colors = new Float32Array(rows * cols * 3);
  const uvs = new Float32Array(rows * cols * 2);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const idx = j * cols + i;
      const x = (i / (cols - 1) - 0.5) * boxWidth;
      const z = (j / (rows - 1) - 0.5) * boxLength;
      const y = matrix[j][i];
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;
      uvs[idx * 2] = i / (cols - 1);
      uvs[idx * 2 + 1] = j / (rows - 1);

      const shade = 0.94 + valueNoise2D(i * 0.4, j * 0.4) * 0.1;
      colors[idx * 3] = shade;
      colors[idx * 3 + 1] = shade;
      colors[idx * 3 + 2] = shade;
    }
  }

  const indices: number[] = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// -----------------------------------------------------------------------------
// Texturas procedurais (canvas) — sem dependência de assets externos. Simulam
// concreto manchado (paredes/piso) e superfície de material a granel ressecado
// e rachado (pilha), com base nas referências fotográficas reais do box.
// -----------------------------------------------------------------------------

function colorToRgb(c: THREE.Color): string {
  return `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
}

function colorToRgba(c: THREE.Color, a: number): string {
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function createStainedConcreteTexture(baseColor: string, stainColor: string, streaks: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const base = new THREE.Color(baseColor);
  const stain = new THREE.Color(stainColor);

  ctx.fillStyle = colorToRgb(base);
  ctx.fillRect(0, 0, size, size);

  const blotchCount = 9;
  for (let i = 0; i < blotchCount; i++) {
    const x = Math.random() * size;
    const y0 = streaks ? Math.random() * size * 0.4 : Math.random() * size;
    const y1 = streaks ? y0 + size * (0.4 + Math.random() * 0.6) : y0;
    const r = size * (0.1 + Math.random() * 0.2);
    const grad = ctx.createRadialGradient(x, y0, 0, x, y1, r);
    grad.addColorStop(0, colorToRgba(stain, 0.35 + Math.random() * 0.2));
    grad.addColorStop(1, colorToRgba(stain, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const tone = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
    ctx.fillStyle = colorToRgba(tone, 0.5);
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createCrackedTerracottaTexture(baseColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const base = new THREE.Color(baseColor);

  ctx.fillStyle = colorToRgb(base);
  ctx.fillRect(0, 0, size, size);

  // Manchas suaves de grande escala (tom do material nunca é perfeitamente uniforme).
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = size * (0.14 + Math.random() * 0.22);
    const tone = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.14);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, colorToRgba(tone, 0.5));
    grad.addColorStop(1, colorToRgba(tone, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Grão fino.
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const tone = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.09);
    ctx.fillStyle = colorToRgba(tone, 0.45);
    ctx.fillRect(x, y, 1.3, 1.3);
  }

  // Rachaduras de material ressecado, como nas fotos de referência: linhas
  // finas ramificadas, não uma grade regular.
  const crackColor = base.clone().offsetHSL(0, 0.05, -0.24);
  ctx.strokeStyle = colorToRgba(crackColor, 0.55);
  ctx.lineCap = 'round';
  for (let s = 0; s < 7; s++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    const branches = 2 + Math.floor(Math.random() * 2);
    for (let b = 0; b < branches; b++) {
      let angle = Math.random() * Math.PI * 2;
      let px = x;
      let py = y;
      ctx.lineWidth = 0.6 + Math.random() * 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      const steps = 5 + Math.floor(Math.random() * 6);
      for (let k = 0; k < steps; k++) {
        angle += (Math.random() - 0.5) * 1.1;
        px += Math.cos(angle) * size * 0.05;
        py += Math.sin(angle) * size * 0.05;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
