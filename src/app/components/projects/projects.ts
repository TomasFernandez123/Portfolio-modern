import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  viewChild,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  imports: [FormsModule],
  host: { class: 'projects' },
})
export class Projects implements OnDestroy {
  private ngZone  = inject(NgZone);
  private trackRef    = viewChild<ElementRef<HTMLElement>>('projectsTrack');
  private wrapperRef  = viewChild<ElementRef<HTMLElement>>('trackWrapper');
  private chatBallRef = viewChild<ElementRef<HTMLElement>>('chatBall');
  private msgContainerRef = viewChild<ElementRef<HTMLElement>>('msgContainer');

  private readonly API = 'https://chatbot-1-nt84.onrender.com/chat';
  private readonly TIMEOUT_MS = 120_000;

  // ── Chat state ──────────────────────────────────────────────────────────────
  readonly chatVisible   = signal(false);
  readonly chatExpanded  = signal(false);
  readonly ballHidden    = signal(false);
  readonly activeChatId  = signal<number | null>(null);
  readonly chatMessages  = signal<ChatMessage[]>([]);
  readonly userInput     = signal('');
  readonly isTyping      = signal(false);
  readonly isStreaming    = signal(false);
  private msgCounter     = 0;
  private streamingMsgId: number | null = null;
  private abortCtrl: AbortController | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly activeChatProject = computed(() =>
    this.projects().find(p => p.id === this.activeChatId())
  );

  // ── Holds the initial ball position (set via JS before GSAP runs) ──────────
  readonly ballLeft = signal(0);
  readonly ballTop  = signal(0);

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
      id: 4,
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

  // ── Chat methods ────────────────────────────────────────────────────────────
  openChat(projectId: number, event: MouseEvent): void {
    event.stopPropagation();
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const ballSize = 52;
    const cx = rect.left + rect.width / 2 - ballSize / 2;
    const cy = rect.top  + rect.height / 2 - ballSize / 2;

    // Reset state
    this.activeChatId.set(projectId);
    this.chatMessages.set([{
      id: ++this.msgCounter,
      role: 'ai',
      text: `Hi! I'm the AI assistant for **${this.projects().find(p => p.id === projectId)?.title}**. Ask me anything about the architecture, stack, or implementation.`,
      timestamp: new Date(),
    }]);
    this.userInput.set('');
    this.ballHidden.set(false);
    this.chatExpanded.set(false);
    this.ballLeft.set(cx);
    this.ballTop.set(cy);
    this.chatVisible.set(true);

    // Animate ball → corner, then expand panel
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const ball = this.chatBallRef()?.nativeElement;
        if (!ball) return;

        const panelW = Math.min(400, window.innerWidth - 32);
        const panelH = 540;
        const marginR = 24;
        const marginB = 24;

        // Final ball resting position = bottom-right corner of future panel
        const targetLeft = window.innerWidth  - marginR - panelW  + panelW / 2  - ballSize / 2;
        const targetTop  = window.innerHeight - marginB - panelH  + panelH / 2  - ballSize / 2;

        gsap.fromTo(ball,
          { left: cx, top: cy, scale: 1, opacity: 1 },
          {
            left: targetLeft,
            top: targetTop,
            scale: 1,
            duration: 0.55,
            ease: 'power3.inOut',
            onComplete: () => {
              this.ngZone.run(() => {
                this.ballHidden.set(true);
                this.chatExpanded.set(true);
                // Bloquear el scroll de la página
                document.documentElement.style.overflow = 'hidden';
              });
            },
          }
        );
      });
    });
  }

  closeChat(): void {
    this.cancelStream();
    this.chatExpanded.set(false);
    // Rehabilitar el scroll
    document.documentElement.style.overflow = '';
    
    // Wait for CSS collapse transition, then unmount
    setTimeout(() => {
      this.chatVisible.set(false);
      this.activeChatId.set(null);
    }, 360);
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.isTyping()) return;

    this.chatMessages.update(msgs => [...msgs, {
      id: ++this.msgCounter,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    }]);
    this.userInput.set('');
    this.isTyping.set(true);
    this.scrollToBottom();

    const project = this.activeChatProject()!;
    const context = [
      `# ${project.title}`,
      `Stack: ${project.tags.join(', ')}`,
      `Description: ${project.description}`,
      `Link: ${project.link}`,
    ].join('\n');

    const slug = project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Create empty AI bubble — will be filled token by token during streaming
    const aiMsgId = ++this.msgCounter;
    this.streamingMsgId = aiMsgId;
    this.chatMessages.update(msgs => [...msgs, {
      id: aiMsgId,
      role: 'ai',
      text: '',
      timestamp: new Date(),
    }]);

    this.abortCtrl = new AbortController();
    this.timeoutId = setTimeout(() => this.abortCtrl?.abort(), this.TIMEOUT_MS);

    this.ngZone.runOutsideAngular(() => {
      fetch(this.API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
        },
        body: JSON.stringify({ message: trimmed, context, project: slug }),
        signal: this.abortCtrl!.signal,
      })
        .then(async (response) => {
          // If the response is not ndjson, fall back to classic JSON
          const contentType = response.headers.get('content-type') ?? '';
          if (!contentType.includes('ndjson') && !contentType.includes('x-ndjson')) {
            return this.handleClassicResponse(response, aiMsgId);
          }

          this.ngZone.run(() => this.isStreaming.set(true));

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? ''; // keep incomplete last line

            for (const raw of lines) {
              const line = raw.trim();
              if (!line) continue;

              let parsed: { type: string; token?: string; text?: string; answer?: string; timestamp?: string } | null = null;
              try {
                parsed = JSON.parse(line);
              } catch {
                // Fallback: treat entire response body as plain text answer
                this.ngZone.run(() => this.finalizeStreamingMsg(aiMsgId, line));
                return;
              }

              if (!parsed) continue;

              const tokenText = parsed.text ?? parsed.token;
              if (parsed.type === 'token' && tokenText) {
                this.ngZone.run(() => {
                  this.chatMessages.update(msgs =>
                    msgs.map(m => m.id === aiMsgId
                      ? { ...m, text: m.text + tokenText }
                      : m
                    )
                  );
                  this.scrollToBottom();
                });
              } else if (parsed.type === 'done') {
                this.ngZone.run(() => this.finalizeStreamingMsg(aiMsgId));
                return;
              } else if (parsed.type === 'error') {
                this.ngZone.run(() => this.setStreamingError(aiMsgId, 'The AI returned an error — please try again.'));
                return;
              }
            }
          }

          // Stream ended without explicit 'done'
          this.ngZone.run(() => this.finalizeStreamingMsg(aiMsgId));
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') {
            // User cancelled or timeout — leave whatever text arrived
            this.ngZone.run(() => this.finalizeStreamingMsg(aiMsgId));
          } else {
            this.ngZone.run(() => this.setStreamingError(aiMsgId, 'Error connecting to the AI — please try again.'));
          }
        });
    });
  }

  cancelStream(): void {
    this.abortCtrl?.abort();
  }

  private finalizeStreamingMsg(aiMsgId: number, overrideText?: string): void {
    if (overrideText !== undefined) {
      this.chatMessages.update(msgs =>
        msgs.map(m => m.id === aiMsgId ? { ...m, text: overrideText } : m)
      );
    }
    // If the bubble is still empty after stream finishes, show a generic error
    const msg = this.chatMessages().find(m => m.id === aiMsgId);
    if (msg?.text.trim() === '') {
      this.chatMessages.update(msgs =>
        msgs.map(m => m.id === aiMsgId
          ? { ...m, text: 'Error connecting to the AI — please try again.' }
          : m
        )
      );
    }
    this.cleanupStream();
  }

  private setStreamingError(aiMsgId: number, errorText: string): void {
    this.chatMessages.update(msgs =>
      msgs.map(m => m.id === aiMsgId ? { ...m, text: errorText } : m)
    );
    this.cleanupStream();
  }

  private cleanupStream(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.abortCtrl    = null;
    this.streamingMsgId = null;
    this.isStreaming.set(false);
    this.isTyping.set(false);
  }

  private async handleClassicResponse(response: Response, aiMsgId: number): Promise<void> {
    try {
      const res = await response.json() as { answer: string; timestamp?: string };
      this.ngZone.run(() => {
        this.chatMessages.update(msgs =>
          msgs.map(m => m.id === aiMsgId
            ? { ...m, text: res.answer, timestamp: res.timestamp ? new Date(res.timestamp) : new Date() }
            : m
          )
        );
        this.cleanupStream();
      });
    } catch {
      this.ngZone.run(() => this.setStreamingError(aiMsgId, 'Error connecting to the AI — please try again.'));
    }
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !this.isTyping()) {
      event.preventDefault();
      this.sendMessage(this.userInput());
    }
  }

  private scrollToBottom(): void {
    // Escapar de la zona y esperar a que Angular dibuje el DOM (el signal update de arriba)
    setTimeout(() => {
      const container = this.msgContainerRef()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 10);
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
