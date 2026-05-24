import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CurrentUser } from '../models/user.model';
import { UsersService } from '../services/users.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private readonly usersService = inject(UsersService);

  private readonly currentUserSignal = signal<CurrentUser | null>(null);
  private readonly isLoadingSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  readonly isAdmin = computed(() => {
    return this.currentUserSignal()?.roles.includes('admin') ?? false;
  });

  readonly isLoggedIn = computed(() => {
    return this.currentUserSignal() !== null;
  });

  loadCurrentUser(): Observable<CurrentUser> {
    this.isLoadingSignal.set(true);

    return this.usersService.getCurrentUser().pipe(
      tap({
        next: (user) => {
          this.currentUserSignal.set(user);
          this.isLoadingSignal.set(false);
        },
        error: () => {
          this.currentUserSignal.set(null);
          this.isLoadingSignal.set(false);
        },
      }),
    );
  }

  setCurrentUser(user: CurrentUser | null): void {
    this.currentUserSignal.set(user);
  }

  clearCurrentUser(): void {
    this.currentUserSignal.set(null);
  }
}