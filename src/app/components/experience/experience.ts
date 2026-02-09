import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface ExperienceItem {
  id: number;
  dateStart: string;
  dateEnd: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

interface Skill {
  name: string;
  level: string;
}

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  host: {
    class: 'experience',
  },
})
export class Experience {
  protected readonly experiences = signal<ExperienceItem[]>([
    {
      id: 1,
      dateStart: '2024',
      dateEnd: 'PRESENT',
      title: 'Full Stack Developer',
      company: 'Angelite (E-commerce Platform)',
      location: 'Argentina',
      description:
        'Designing and developing REST APIs with NestJS and MongoDB. Implementing payment gateways, shipping rate calculations, and cloud-based media management. Building a modular, responsive frontend with Angular.',
    },
    {
      id: 2,
      dateStart: '2025',
      dateEnd: '2025',
      title: 'Team Leader & Full Stack Developer',
      company: 'UTN Final Project',
      location: 'Avellaneda',
      description:
        'Led an agile development team using Scrum and GitHub workflows. Developed a mobile management app with Flutter and a web dashboard with Angular, integrating real-time push notifications.',
    },
    {
      id: 3,
      dateStart: '2024',
      dateEnd: '2025',
      title: 'Técnico Universitario en Programación',
      company: 'Universidad Tecnológica Nacional (UTN)',
      location: 'Avellaneda, Argentina',
      description:
        'Specialized in Software Development (OOP), Database Management (SQL/NoSQL), and Agile Methodologies. Graduated in December 2025.',
    },
  ]);

  protected readonly skills = signal<Skill[]>([
    { name: 'TypeScript', level: '█████████░' }, // Lenguaje principal en todos tus proyectos [cite: 9, 22]
    { name: 'Angular', level: '█████████░' }, // Usado en Angelite, Nexora y Gestión de Restaurante [cite: 19, 29, 32]
    { name: 'NestJS', level: '████████░░' }, // Backend de tus dos proyectos más grandes
    { name: 'Node.js', level: '████████░░' }, // Base de tu stack de backend [cite: 10, 22]
    { name: 'MongoDB', level: '████████░░' }, // Base de datos principal en tus proyectos de NestJS
    { name: 'Flutter', level: '███████░░░' }, // Proyecto final académico como Team Leader
    { name: 'Java', level: '██████░░░░' }, // Formación académica fuerte en UTN [cite: 36]
    { name: 'SQL / PostgreSQL', level: '██████░░░░' }, // Formación académica y manejo de Supabase [cite: 29, 37]
    { name: 'React', level: '█████░░░░░' }, // Listado en habilidades, pero sin proyectos específicos detallados [cite: 10]
    { name: 'Git / GitHub', level: '████████░░' }, // Agregado: Esencial [cite: 12]
    { name: 'English (B2)', level: '███████░░░' },
    { name: 'Python', level: '█████░░░░░' }, // Agregado: Está en tu CV
    { name: 'Scrum / Agile', level: '████████░░' },
  ]);

  protected isTerminalActive = signal(true);
  protected isMobile = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  private checkMobile() {
    const mobile = window.innerWidth <= 768;
    this.isMobile.set(mobile);
    if (mobile) {
      this.isTerminalActive.set(true);
    }
  }

  onTerminalHover(active: boolean) {
    if (!this.isMobile()) {
      this.isTerminalActive.set(active);
    }
  }

  onTerminalClick() {
    if (this.isMobile()) {
      this.isTerminalActive.update((v) => !v);
    }
  }
}
