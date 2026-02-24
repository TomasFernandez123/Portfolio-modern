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

interface TerminalLine {
  id: number;
  type: 'cmd' | 'out' | 'success' | 'dim' | 'accent' | 'error';
  text: string;
}

interface ExperienceItem {
  id: number;
  dateStart: string;
  dateEnd: string;
  title: string;
  company: string;
  location: string;
  description: string;
  commands: string[];
  branchName: string;
  commitHash: string;
  type: 'work' | 'education';
}

interface Skill {
  name: string;
  level: string;
}

const ITEM_H = 250;
const FIRST_Y = 64;
const TRUNK_X = 36;
const SVG_W = 80;

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  host: { class: 'experience' },
})
export class Experience implements OnDestroy {
  private ngZone = inject(NgZone);
  private sectionRef = viewChild<ElementRef<HTMLElement>>('experienceSection');
  private trunkLineRef = viewChild<ElementRef<HTMLElement>>('trunkLine');
  private termBodyRef = viewChild<ElementRef<HTMLElement>>('termBody');
  private termInputRef = viewChild<ElementRef<HTMLInputElement>>('termInput');

  protected activeTooltip = signal<number | null>(null);

  // ── Live terminal state ─────────────────────────────────────────────────────
  protected terminalLines = signal<TerminalLine[]>([]);
  protected typingText = signal<string | null>(null);
  protected showInput = signal(false);
  protected userInput = signal('');
  protected isInputFocused = signal(false);
  private cmdHistory: string[] = [];
  private historyIdx = -1;
  private lineIdCounter = 0;
  private termTimers: ReturnType<typeof setTimeout>[] = [];
  private bootStarted = false;

  private readonly COMMANDS: Record<string, () => TerminalLine[]> = {
    ls: () => [
      this.mkLine('dim', 'projects/'),
      this.mkLine('accent', '  angelite-platform/   mantecapp/'),
      this.mkLine('accent', '  nexora/               arcadia-sala-juegos/'),
      this.mkLine('accent', '  note-flow/'),
    ],
    whoami: () => [
      this.mkLine('success', 'tomás fernandez'),
      this.mkLine('out', 'Full Stack Developer · Buenos Aires, AR'),
      this.mkLine('dim', '──────────────────────────────────────'),
      this.mkLine('out', '   UTN Técnico Universitario en Programación'),
      this.mkLine('out', '   Angular · NestJS · TypeScript ecosystem'),
      this.mkLine('out', '   English B2 — targeting C1'),
      this.mkLine('success', '   Available for new opportunities'),
    ],
    'git log': () => [
      this.mkLine('accent', 'a3f8d12 feat: angelite e-commerce platform'),
      this.mkLine('accent', 'c91be47 feat: mantecapp mobile app'),
      this.mkLine('accent', 'f204c08 tag: v1.0.0 utn-graduation'),
    ],
    'cat skills': () => [
      this.mkLine('dim', '{'),
      this.mkLine('out', '  "TypeScript": "█████████░",'),
      this.mkLine('out', '  "Angular":    "█████████░",'),
      this.mkLine('out', '  "NestJS":     "████████░░",'),
      this.mkLine('out', '  "Node.js":    "████████░░",'),
      this.mkLine('out', '  "MongoDB":    "████████░░",'),
      this.mkLine('out', '  "Flutter":    "███████░░░",'),
      this.mkLine('out', '  "Java":       "██████░░░░",'),
      this.mkLine('out', '  "SQL / PostgreSQL": "██████░░░░",'),
      this.mkLine('out', '  "React":      "██████░░░░",'),
      this.mkLine('out', '  "Git / GitHub": "████████░░",'),
      this.mkLine('out', '  "English (C1)": "████████░░",'),
      this.mkLine('out', '  "Python":     "██████░░░░",'),
      this.mkLine('out', '  "Docker / Nginx": "███████░░░"'),
      this.mkLine('dim', '}'),
    ],
    'git status': () => [
      this.mkLine('success', 'On branch main'),
      this.mkLine('success', 'nothing to commit, working tree clean ✓'),
    ],
    'npm run build': () => [
      this.mkLine('dim', '> building...'),
      this.mkLine('success', '✓ Build successful in 2.1s'),
    ],
    help: () => [
      this.mkLine('dim', 'Available commands:'),
      this.mkLine('out', '  ls             list projects'),
      this.mkLine('out', '  whoami         show profile summary'),
      this.mkLine('out', '  git log        career commit history'),
      this.mkLine('out', '  cat skills     tech skill levels'),
      this.mkLine('out', '  git status     current status'),
      this.mkLine('out', '  npm run build  build check'),
      this.mkLine('out', '  clear          clear screen'),
    ],
  };

  protected readonly experiences = signal<ExperienceItem[]>([
    {
      id: 1,
      dateStart: '2024',
      dateEnd: 'PRESENT',
      title: 'Full Stack Developer',
      company: 'Angelite E-Commerce Platform',
      location: 'Argentina',
      type: 'work',
      branchName: 'feat/angelite-platform',
      commitHash: 'a3f8d12',
      description:
        'Designing and developing REST APIs with NestJS and MongoDB. Implementing payment gateways, shipping rate calculations, and cloud-based media management. Building a modular, responsive frontend with Angular.',
      commands: [
        'nest new angelite-api --strict',
        'docker-compose up -d mongodb redis',
        'ng build --configuration production',
        'git merge feat/payment-gateway',
      ],
    },
    {
      id: 2,
      dateStart: '2025',
      dateEnd: '2025',
      title: 'Team Leader & Full Stack Developer',
      company: 'UTN Final Project',
      location: 'Avellaneda',
      type: 'work',
      branchName: 'feat/mantecapp-mobile',
      commitHash: 'c91be47',
      description:
        'Led an agile development team using Scrum and GitHub workflows. Developed a mobile management app with Flutter and a web dashboard with Angular, integrating real-time push notifications.',
      commands: [
        'flutter pub add supabase_flutter',
        'git flow feature start push-notifs',
        'firebase deploy --only functions',
        'git merge feat/mantecapp-mobile',
      ],
    },
    {
      id: 3,
      dateStart: '2022',
      dateEnd: '2025',
      title: 'Técnico Universitario en Programación',
      company: 'Universidad Tecnológica Nacional (UTN)',
      location: 'Avellaneda, Argentina',
      type: 'education',
      branchName: 'edu/utn-degree',
      commitHash: 'f204c08',
      description:
        'Specialized in Software Development (OOP), Database Management (SQL/NoSQL), and Agile Methodologies. Graduated in December 2025.',
      commands: [
        'git checkout -b edu/utn-degree',
        'mvn compile -Dmaven.test.skip=false',
        'psql -U student -d databases_final',
        'git tag -a v1.0.0 -m "Graduation"',
      ],
    },
  ]);

  protected readonly skills = signal<Skill[]>([
    { name: 'TypeScript', level: '█████████░' },
    { name: 'Angular', level: '█████████░' },
    { name: 'NestJS', level: '████████░░' },
    { name: 'Node.js', level: '████████░░' },
    { name: 'MongoDB', level: '████████░░' },
    { name: 'Flutter', level: '███████░░░' },
    { name: 'Java', level: '██████░░░░' },
    { name: 'SQL / PostgreSQL', level: '██████░░░░' },
    { name: 'React', level: '█████░░░░░' },
    { name: 'Git / GitHub', level: '████████░░' },
    { name: 'English (B2)', level: '███████░░░' },
    { name: 'Python', level: '█████░░░░░' },
    { name: 'Scrum / Agile', level: '████████░░' },
  ]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor() {
    if (typeof window !== 'undefined') {
      this.checkMobile();
    }
    afterNextRender(() => this.initGitAnimation());
  }

  private checkMobile(): void {
    if (window.innerWidth <= 768) {
      this.showInput.set(true);
    }
  }

  private initGitAnimation(): void {
    if (window.innerWidth < 768) return;
    const section = this.sectionRef()?.nativeElement;
    const trunkLine = this.trunkLineRef()?.nativeElement;
    if (!section || !trunkLine) return;

    this.ngZone.runOutsideAngular(() => {
      // Animate trunk div height from 0 → 100% — always matches real content height
      gsap.set(trunkLine, { height: 0 });
      gsap.to(trunkLine, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          end: 'bottom 55%',
          scrub: 1.4,
        },
      });

      // Pop-in commit node circles
      const nodes = section.querySelectorAll<HTMLElement>('.git-node');
      nodes.forEach((node, i) => {
        gsap.set(node, { opacity: 0, scale: 0.2 });
        ScrollTrigger.create({
          trigger: node,
          start: 'top 84%',
          once: true,
          onEnter: () =>
            gsap.to(node, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)' }),
        });
      });

      // Slide-in cards
      const cards = section.querySelectorAll<HTMLElement>('.git-card');
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, x: 24 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 82%',
          once: true,
          onEnter: () =>
            gsap.to(card, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }),
        });
      });

      // Terminal boot sequence
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        once: true,
        onEnter: () => this.ngZone.run(() => void this.runBootSequence()),
      });
    });
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────
  setActiveTooltip(id: number | null): void {
    this.activeTooltip.set(id);
  }

  // ── Live Terminal methods ────────────────────────────────────────────────────
  private mkLine(type: TerminalLine['type'], text: string): TerminalLine {
    return { id: this.lineIdCounter++, type, text };
  }

  private scheduleScroll(): void {
    const t = setTimeout(() => {
      const el = this.termBodyRef()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
    this.termTimers.push(t);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      this.termTimers.push(t);
    });
  }

  private async typeCommandAnim(cmd: string): Promise<void> {
    this.typingText.set('');
    for (const ch of cmd.split('')) {
      await this.sleep(40 + Math.random() * 22);
      this.typingText.update((t) => (t ?? '') + ch);
      this.scheduleScroll();
    }
    await this.sleep(260);
    this.terminalLines.update((lines) => [...lines, this.mkLine('cmd', cmd)]);
    this.typingText.set(null);
    this.scheduleScroll();
  }

  private async runBootSequence(): Promise<void> {
    if (this.bootStarted) return;
    this.bootStarted = true;

    await this.sleep(500);
    await this.typeCommandAnim('npm install experience');
    await this.sleep(180);
    this.terminalLines.update((l) => [
      ...l,
      this.mkLine('dim', '⠺ Installing packages...'),
      this.mkLine('success', 'added 3 packages in 2.4s'),
      this.mkLine('success', '✓ Full Stack Developer'),
      this.mkLine('success', '✓ Team Leader & UTN Graduate'),
    ]);
    this.scheduleScroll();

    await this.sleep(700);
    await this.typeCommandAnim('git log --oneline -3');
    await this.sleep(180);
    this.terminalLines.update((l) => [
      ...l,
      this.mkLine('accent', 'a3f8d12 feat: angelite e-commerce platform'),
      this.mkLine('accent', 'c91be47 feat: mantecapp mobile app'),
      this.mkLine('accent', 'f204c08 tag: v1.0.0 utn-graduation'),
    ]);
    this.scheduleScroll();

    await this.sleep(500);
    this.terminalLines.update((l) => [...l, this.mkLine('dim', "\ntype 'help' for available commands")]);
    this.showInput.set(true);
    this.scheduleScroll();

    // Focus input after render
    const t = setTimeout(() => this.termInputRef()?.nativeElement?.focus(), 60);
    this.termTimers.push(t);
  }

  submitCommand(): void {
    const raw = this.userInput().trim();
    if (!raw) return;
    const cmd = raw.toLowerCase();
    this.cmdHistory.unshift(cmd);
    this.historyIdx = -1;
    this.userInput.set('');

    this.terminalLines.update((l) => [...l, this.mkLine('cmd', raw)]);

    if (cmd === 'clear') {
      this.terminalLines.set([]);
      this.scheduleScroll();
      return;
    }

    const handler = this.COMMANDS[cmd];
    if (handler) {
      this.terminalLines.update((l) => [...l, ...handler()]);
    } else {
      this.terminalLines.update((l) => [
        ...l,
        this.mkLine('error', `command not found: ${cmd}  (try 'help')`),
      ]);
    }
    this.scheduleScroll();
  }

  historyUp(): void {
    if (this.cmdHistory.length === 0) return;
    this.historyIdx = Math.min(this.historyIdx + 1, this.cmdHistory.length - 1);
    this.userInput.set(this.cmdHistory[this.historyIdx]);
  }

  focusInput(): void {
    this.termInputRef()?.nativeElement?.focus();
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    this.termTimers.forEach(clearTimeout);
  }
}
