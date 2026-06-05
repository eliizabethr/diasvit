import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CurrentUser } from '../../../core/models/user.model';

interface PublicHeaderNavItem {
  label: string;
  sectionId: string;
}

@Component({
  selector: 'app-public-header',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './public-header.html',
  styleUrl: './public-header.scss',
})
export class PublicHeader {
  private readonly router = inject(Router);

  readonly currentUser = input<CurrentUser | null>(null);
  readonly isAuthenticated = input(false);
  readonly showAdminLink = input(false);

  readonly logoutRequested = output<void>();

  readonly hasAuthenticatedActions = computed(() => {
    return this.currentUser() !== null || this.isAuthenticated();
  });

  readonly navItems: PublicHeaderNavItem[] = [
    { label: 'Головна', sectionId: 'home' },
    { label: 'Про нас', sectionId: 'about' },
    { label: 'Галерея', sectionId: 'gallery' },
    { label: 'Отримати допомогу', sectionId: 'application' },
    { label: 'Контакти', sectionId: 'contacts' },
  ];

  navigateToSection(event: Event, sectionId: string): void {
    event.preventDefault();

    if (this.isHomeRoute()) {
      this.scrollToSection(sectionId);
      window.history.pushState(null, '', `#${sectionId}`);
      return;
    }

    this.router.navigate(['/'], { fragment: sectionId });
  }

  requestLogout(): void {
    this.logoutRequested.emit();
  }

  private isHomeRoute(): boolean {
    const path = this.router.url.split('#')[0].split('?')[0];

    return path === '' || path === '/';
  }

  private scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
