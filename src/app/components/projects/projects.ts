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
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770676197/Gemini_Generated_Image_95kzjs95kzjs95kz_x5o7mp.png',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Paypal', 'Mercado Pago'],
      link: 'https://www.angelite.lat/',
      linkText: 'View Case Study',
      linkIcon: 'external',
    },
    {
      id: 2,
      title: 'MantecApp',
      bgWord: 'MANTECAPP',
      image: 'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677779/icon-only_llzk7x.png',
      tags: ['Ionic', 'Supabase', 'Realtime', 'Firebase', 'Push notifications'],
      link: 'https://github.com/TomasFernandez123/mantecApp-2025',
      linkText: 'View Code',
      linkIcon: 'github',
    },
    {
      id: 3,
      title: 'Nexora',
      bgWord: 'NEXORA',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Realtime'],
      link: 'https://nexora-front.vercel.app/login',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
    {
      id: 4,
      title: 'Arcadia Sala de juegos',
      bgWord: 'ARCADIA',
      image:
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677212/Screenshot_from_2026-02-09_19-46-34_asd6bj.png',
      tags: ['Angular', 'Tailwind', 'Supabase', 'Realtime', 'Chat', 'WebSockets'],
      link: 'https://sala-juegos-eta.vercel.app/home',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
    {
      id: 5,
      title: 'Note Flow',
      bgWord: 'NOTEFLOW',
      image:
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677524/Screenshot_from_2026-02-09_19-51-47_zn8nf1.png',
      tags: ['Angular', 'NestJS', 'PostgreSQL', 'Docker', 'JWT', 'WebSockets'],
      link: 'https://fernandez-9a73ac.vercel.app',
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
