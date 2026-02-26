import {
  Component,
  ChangeDetectionStrategy,
  signal,
  viewChild,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  bgWord: string;
  image: string;
  tags: string[];
  description: string;
  link: string;
  linkText: string;
  linkIcon: 'external' | 'github' | 'demo' | 'download' | 'docs';
}

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  host: { class: 'projects' },
})
export class Projects implements OnDestroy {
  private ngZone = inject(NgZone);
  private trackRef = viewChild<ElementRef<HTMLElement>>('projectsTrack');
  private wrapperRef = viewChild<ElementRef<HTMLElement>>('trackWrapper');

  protected readonly projects = signal<Project[]>([
    {
      id: 1,
      title: 'Angelite E-Commerce Platform',
      bgWord: 'ANGELITE',
      image:
        'https://res.cloudinary.com/dysnqj5cq/image/upload/v1772065668/Gemini_Generated_Image_4g3ca84g3ca84g3c_ms43ct.png',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Paypal', 'Mercado Pago'],
      description: 'Plataforma e-commerce full-stack desarrollada con Angular + NestJS, enfocada en rendimiento, escalabilidad y experiencia de compra moderna. Permite gestión completa de productos con variantes, categorías dinámicas, imágenes en Cloudinary y panel administrativo avanzado. Integra pagos online mediante PayPal y Mercado Pago, soporte multi-moneda y arquitectura preparada para múltiples tiendas. Backend construido sobre MongoDB con enfoque modular y preparado para despliegue en entornos Dockerizados.',
      link: 'https://www.angelite.lat/',
      linkText: 'View Case Study',
      linkIcon: 'external',
    },
    {
      id: 2,
      title: 'Syncro',
      bgWord: 'SYNCRO',
      image:
        'https://res.cloudinary.com/dysnqj5cq/image/upload/v1771973729/syncro/logos/tenant_699a17f96409c641fa3acc3d_logo.png',
      tags: ['Angular', 'Nest.js', 'MongoDB', 'WhatsApp API', 'Brevo', 'Realtime'],
      description: 'SaaS multi-tenant orientado a gestión de turnos y recordatorios automatizados. Construido con Angular + NestJS + MongoDB, incorpora comunicación en tiempo real y sistema de notificaciones por WhatsApp y email. Integra la API oficial de WhatsApp para envío de recordatorios automáticos y utiliza Brevo para campañas y notificaciones transaccionales. Diseñado para negocios con múltiples sucursales, arquitectura desacoplada y preparado para escalar horizontalmente.',
      link: 'https://www.syncrolab.tech/',
      linkText: 'View Case Study',
      linkIcon: 'external',
    },
    {
      id: 3,
      title: 'MantecApp',
      bgWord: 'MANTECAPP',
      image: 'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677779/icon-only_llzk7x.png',
      tags: ['Ionic', 'Supabase', 'Realtime', 'Firebase', 'Push notifications'],
      description: 'Aplicación móvil desarrollada con Ionic, orientada a gestión de mantenimientos y seguimiento de tareas técnicas. Implementa backend serverless con Supabase y sincronización en tiempo real. Incluye autenticación segura, almacenamiento en la nube, notificaciones push mediante Firebase y sistema de actualización instantánea de datos. Pensada como solución ligera, multiplataforma y lista para producción.',
      link: 'https://github.com/TomasFernandez123/mantecApp-2025',
      linkText: 'View Code',
      linkIcon: 'github',
    },
    {
      id: 4,
      title: 'Nexora',
      bgWord: 'NEXORA',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Realtime'],
      description: 'Red social full-stack desarrollada con Angular + NestJS, centrada en interacción en tiempo real. Permite publicación de posts, likes, comentarios y sistema de autenticación con JWT en cookies HTTP-Only. Implementa comunicación realtime con WebSockets y almacenamiento en MongoDB. Diseño UI moderno con Tailwind y arquitectura modular preparada para microservicios. Proyecto enfocado en performance, escalabilidad y buenas prácticas backend.',
      link: 'https://nexora-front.vercel.app/login',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
    {
      id: 5,
      title: 'Arcadia Sala de juegos',
      bgWord: 'ARCADIA',
      image:
        'https://res.cloudinary.com/dysnqj5cq/image/upload/v1772066197/Gemini_Generated_Image_pd8psepd8psepd8p_yg3us2.png',
      tags: ['Angular', 'Tailwind', 'Supabase', 'Realtime', 'Chat', 'WebSockets'],
      description: 'Plataforma web interactiva con sistema de salas multijugador en tiempo real. Construida con Angular + Supabase, integra chat en vivo mediante WebSockets y sincronización instantánea de partidas. Incluye autenticación, gestión de usuarios concurrentes y lógica de juego compartida en tiempo real. Arquitectura optimizada para baja latencia y experiencia fluida en navegadores modernos.',
      link: 'https://sala-juegos-eta.vercel.app/home',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
  ]);

  constructor() {
    afterNextRender(() => this.initScrollTrigger());
  }

  slideNumber(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  totalLabel(): string {
    return String(this.projects().length).padStart(2, '0');
  }

  private initScrollTrigger(): void {
    const track = this.trackRef()?.nativeElement;
    const wrapper = this.wrapperRef()?.nativeElement;
    if (!track || !wrapper) return;

    this.ngZone.runOutsideAngular(() => {
      gsap.set('.slide-bg-text', { x: 0 });

      const getXDelta = () => -(track.scrollWidth - window.innerWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${Math.abs(getXDelta())}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Main track translates left
      tl.to(track, { x: getXDelta, ease: 'none' }, 0);

      // Bg-text drifts right at 38% speed — perceived parallax depth
      tl.to('.slide-bg-text', { x: () => Math.abs(getXDelta()) * 0.38, ease: 'none' }, 0);
    });
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }
}
