import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [ReactiveFormsModule],
  host: {
    class: 'contact',
  },
})
export class Contact {
  private fb = inject(FormBuilder);
  private publicKey = import.meta.env['NG_APP_EMAILJS_PUBLIC_KEY'];
  private serviceID = import.meta.env['NG_APP_EMAILJS_SERVICE_ID'];
  private templateID = import.meta.env['NG_APP_EMAILJS_TEMPLATE_ID'];

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  isSending = signal(false);
  submitStatus = signal<'idle' | 'success' | 'error'>('idle');

  onSubmit() {
    if (this.contactForm.valid) {
      this.sendEmail();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  private sendEmail() {
    if (this.contactForm.invalid || this.isSending()) return;

    this.isSending.set(true);
    this.submitStatus.set('idle');

    emailjs
      .send(
        this.serviceID,
        this.templateID,
        this.contactForm.value as Record<string, string>,
        this.publicKey,
      )
      .then(
        (result: EmailJSResponseStatus) => {
          console.log('Email sent successfully!', result.text);
          this.contactForm.reset();
          this.submitStatus.set('success');
          this.isSending.set(false);
        },
        (error) => {
          console.error('Error sending email:', error.text);
          this.submitStatus.set('error');
          this.isSending.set(false);
        },
      );
  }
}
