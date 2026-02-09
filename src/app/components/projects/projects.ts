import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface Project {
  id: number;
  title: string;
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
  host: {
    class: 'projects',
  },
})
export class Projects {
  protected readonly projects = signal<Project[]>([
    {
      id: 1,
      title: 'Angelite E-Commerce Platform',
      image:
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770676197/Gemini_Generated_Image_95kzjs95kzjs95kz_x5o7mp.png',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Paypal', 'Mercado Pago', 'Shipping'],
      link: 'https://www.angelite.lat/',
      linkText: 'View Case Study',
      linkIcon: 'external',
    },
    {
      id: 2,
      title: 'MantecApp',
      image: 'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677779/icon-only_llzk7x.png',
      tags: ['Ionic', 'Supabase', 'Realtime', 'Shipping', 'Firebase', 'Push notifications'],
      link: 'https://github.com/TomasFernandez123/mantecApp-2025',
      linkText: 'View Code',
      linkIcon: 'github',
    },
    {
      id: 3,
      title: 'Nexora',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop',
      tags: ['Angular', 'Nest.js', 'Tailwind', 'MongoDB', 'Realtime'],
      link: 'https://nexora-front.vercel.app/login',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
    {
      id: 4,
      title: 'Arcadia Sala de juegos',
      image:
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677212/Screenshot_from_2026-02-09_19-46-34_asd6bj.png',
      tags: ['Angular', 'Tailwind', 'Supabase', 'Realtime', 'Chat', 'WebSockets'],
      link: 'https://sala-juegos-eta.vercel.app/home',
      linkText: 'Live Demo / Temporaly disabled',
      linkIcon: 'demo',
    },
    {
      id: 5,
      title: 'Note Flow',
      image:
        'https://res.cloudinary.com/dp2ccjqoy/image/upload/v1770677524/Screenshot_from_2026-02-09_19-51-47_zn8nf1.png',
      tags: ['Angular', 'NestJS', 'Postgress', 'Docker', 'JWT', 'WebSockets'],
      link: 'https://fernandez-9a73ac.vercel.app',
      linkText: 'Live Demo',
      linkIcon: 'demo',
    },
  ]);
}
