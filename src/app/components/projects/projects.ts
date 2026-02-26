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
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Phasellus in felis non nisl fermentum.',
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
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Phasellus in felis non nisl fermentum.',
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
      description: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Proin eget tortor risus et venenatis.',
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
      description: 'Curabitur aliquet quam id dui posuere blandit. Pellentesque in ipsum id orci porta dapibus. Nulla quis lorem ut libero malesuada feugiat ac non sem et felis blandit.',
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
      description: 'Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Vivamus magna justo, lacinia eget consectetur sed.',
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
