import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  viewChild,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as THREE from 'three';

interface RackEntry {
  mesh: THREE.LineSegments;
  basePos: THREE.Vector3;
  explodeVec: THREE.Vector3;
  mat: THREE.LineBasicMaterial;
  baseOpacity: number;
}

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  host: { class: 'hero' },
})
export class Hero implements OnDestroy {
  private document = inject(DOCUMENT);
  private ngZone = inject(NgZone);
  protected isMenuOpen = signal(false);
  protected isScrolled = signal(false);

  private canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('threeCanvas');

  // Three.js state
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rafId = 0;
  private racks: RackEntry[] = [];
  private connections!: THREE.LineSegments;
  private connectionMat!: THREE.LineBasicMaterial;
  private particles!: THREE.Points;
  private mouseTarget = new THREE.Vector2(0, 0);
  private scrollProgress = 0;

  constructor() {
    afterNextRender(() => this.initScene());
  }

  // ─── Scene init ─────────────────────────────────────────────────────────────

  private initScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const section = canvas.closest('.hero-section') as HTMLElement;
    const w = section.clientWidth;
    const h = section.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.buildServerCluster();
    this.buildParticles();

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize);
      this.rafId = requestAnimationFrame(this.animate);
    });
  }

  // ─── Geometry builders ──────────────────────────────────────────────────────

  private buildServerCluster(): void {
    const rackData: { pos: [number, number, number]; depthFactor: number }[] = [
      { pos: [-4.5, -1.0, -3.0], depthFactor: 0.85 },
      { pos: [-2.2, 1.2, -4.5], depthFactor: 0.65 },
      { pos: [0.0, -1.5, -5.5], depthFactor: 0.55 },
      { pos: [2.5, 0.5, -3.5], depthFactor: 0.78 },
      { pos: [4.2, -1.0, -4.0], depthFactor: 0.68 },
      { pos: [-3.0, 1.8, -6.5], depthFactor: 0.42 },
      { pos: [-0.8, -0.5, -7.0], depthFactor: 0.38 },
      { pos: [1.2, 1.2, -6.0], depthFactor: 0.48 },
      { pos: [3.5, 1.8, -7.5], depthFactor: 0.32 },
      { pos: [-5.0, 0.2, -5.5], depthFactor: 0.52 },
    ];

    rackData.forEach((data) => {
      const geo = new THREE.BoxGeometry(1.2, 2.0, 0.5);
      const edges = new THREE.EdgesGeometry(geo);
      geo.dispose();

      const baseOpacity = data.depthFactor * 0.9;
      const mat = new THREE.LineBasicMaterial({
        color: 0x00fff0,
        transparent: true,
        opacity: baseOpacity,
      });
      const rack = new THREE.LineSegments(edges, mat);

      const basePos = new THREE.Vector3(...data.pos);
      rack.position.copy(basePos);
      rack.rotation.y = (Math.random() - 0.5) * 0.4;
      rack.rotation.x = (Math.random() - 0.5) * 0.1;

      const explodeVec = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        Math.random() * 14 + 5,
      );

      this.racks.push({ mesh: rack, basePos: basePos.clone(), explodeVec, mat, baseOpacity });
      this.scene.add(rack);
    });

    this.buildConnections();
  }

  private buildConnections(): void {
    const positions: number[] = [];
    const basePosArr = this.racks.map((r) => r.basePos);

    for (let i = 0; i < basePosArr.length; i++) {
      for (let j = i + 1; j < basePosArr.length; j++) {
        if (basePosArr[i].distanceTo(basePosArr[j]) < 4.5) {
          positions.push(
            basePosArr[i].x, basePosArr[i].y, basePosArr[i].z,
            basePosArr[j].x, basePosArr[j].y, basePosArr[j].z,
          );
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.connectionMat = new THREE.LineBasicMaterial({
      color: 0x00fff0,
      transparent: true,
      opacity: 0.18,
    });
    this.connections = new THREE.LineSegments(geo, this.connectionMat);
    this.scene.add(this.connections);
  }

  private buildParticles(): void {
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = Math.random() * -10 - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00fff0, size: 0.05, transparent: true, opacity: 0.45 });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  // ─── Event handlers ─────────────────────────────────────────────────────────

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
  };

  private onScroll = (): void => {
    const section = this.canvasRef()?.nativeElement?.closest('.hero-section') as HTMLElement;
    if (!section) return;
    this.scrollProgress = Math.min(1, window.scrollY / section.clientHeight);
    const scrolled = window.scrollY > 10;
    if (scrolled !== this.isScrolled()) {
      this.ngZone.run(() => this.isScrolled.set(scrolled));
    }
  };

  private onResize = (): void => {
    const section = this.canvasRef()?.nativeElement?.closest('.hero-section') as HTMLElement;
    if (!section) return;
    const w = section.clientWidth;
    const h = section.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  // ─── Render loop ─────────────────────────────────────────────────────────────

  private animate = (): void => {
    this.rafId = requestAnimationFrame(this.animate);
    const sp = this.scrollProgress;
    const sp2 = sp * sp;

    // Camera parallax (lerp toward mouse target)
    this.camera.position.x += (this.mouseTarget.x * 0.8 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseTarget.y * 0.4 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    // Racks: idle rotation + scroll explode
    this.racks.forEach((r, i) => {
      r.mesh.rotation.y += 0.0007 + i * 0.00006;
      r.mesh.position.x = r.basePos.x + r.explodeVec.x * sp2;
      r.mesh.position.y = r.basePos.y + r.explodeVec.y * sp2;
      r.mesh.position.z = r.basePos.z + r.explodeVec.z * sp2;
      r.mat.opacity = r.baseOpacity * (1 - sp * 0.9);
    });

    // Connections & particles fade on scroll
    this.connectionMat.opacity = 0.18 * (1 - sp);
    (this.particles.material as THREE.PointsMaterial).opacity = 0.45 * (1 - sp);
    // Subtle particle drift
    this.particles.rotation.y += 0.00015;

    this.renderer.render(this.scene, this.camera);
  };

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
  }

  // ─── Menu ────────────────────────────────────────────────────────────────────

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
    this.document.body.style.overflow = this.isMenuOpen() ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.document.body.style.overflow = '';
  }
}
