import { Component, ChangeDetectionStrategy, inject, signal, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';

type SubmitState = 'idle' | 'folding' | 'flying' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [ReactiveFormsModule],
  host: { class: 'contact' },
})
export class Contact {
  private fb = inject(FormBuilder);
  private ngZone = inject(NgZone);
  private publicKey = import.meta.env['NG_APP_EMAILJS_PUBLIC_KEY'];
  private serviceID = import.meta.env['NG_APP_EMAILJS_SERVICE_ID'];
  private templateID = import.meta.env['NG_APP_EMAILJS_TEMPLATE_ID'];

  readonly MY_EMAIL = 'tomas.fernandez.tech@gmail.com';

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitState = signal<SubmitState>('idle');
  copyStatus = signal<'idle' | 'copied'>('idle');
  isSending = signal(false);

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.runSendAnimation();
  }

  private runSendAnimation(): void {
    this.submitState.set('folding');
    this.isSending.set(true);

    const emailPromise = this.doSendEmail();

    // Transition to flying after fold animation (~460ms)
    setTimeout(() => {
      this.ngZone.run(() => {
        this.submitState.set('flying');

        // Wait for plane flight (900ms) + email to both resolve
        Promise.all([
          new Promise<void>((r) => setTimeout(r, 900)),
          emailPromise,
        ]).then(([, result]) => {
          this.ngZone.run(() => {
            if (result === 'success') {
              this.submitState.set('success');
              this.contactForm.reset();
            } else {
              this.submitState.set('error');
            }
            this.isSending.set(false);
          });
        });
      });
    }, 460);
  }

  private doSendEmail(): Promise<'success' | 'error'> {
    return emailjs
      .send(
        this.serviceID,
        this.templateID,
        this.contactForm.value as Record<string, string>,
        this.publicKey,
      )
      .then(() => 'success' as const)
      .catch(() => 'error' as const);
  }

  copyEmail(): void {
    navigator.clipboard.writeText(this.MY_EMAIL).then(() => {
      this.copyStatus.set('copied');
      setTimeout(() => this.copyStatus.set('idle'), 2200);
    });
  }

  retryForm(): void {
    this.submitState.set('idle');
    this.isSending.set(false);
  }
}
