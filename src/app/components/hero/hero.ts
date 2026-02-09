import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  host: {
    class: 'hero',
  },
})
export class Hero {
  private document = inject(DOCUMENT);
  protected isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
    if (this.isMenuOpen()) {
      this.document.body.style.overflow = 'hidden';
    } else {
      this.document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.document.body.style.overflow = '';
  }
}
