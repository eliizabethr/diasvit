import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatFullName } from '../../../shared/utils/user.util';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly router = inject(Router);

  readonly currentUser = this.currentUserService.currentUser;
  readonly errorMessage = signal('');

  readonly adminFullName = computed(() => {
    const user = this.currentUser();
    return user ? formatFullName(user) : 'Адміністратор';
  });

  ngOnInit(): void {
    if (this.currentUser()) {
      return;
    }

    this.currentUserService.loadCurrentUser().subscribe({
      error: (error) => {
        this.errorMessage.set(getApiErrorMessage(error));
        this.logout();
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.currentUserService.clearCurrentUser();
    this.router.navigateByUrl('/');
  }
}