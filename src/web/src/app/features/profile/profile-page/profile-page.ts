import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { UserApplication } from '../../../core/models/application.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { PublicHeader } from '../../../shared/components/public-header/public-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import {
  formatApplicationFulfillment,
  formatApplicationItemsShort,
  formatApplicationNumber,
} from '../../../shared/utils/application.util';
import { formatDate } from '../../../shared/utils/date.util';
import { formatUkrainianPhoneInput } from '../../../shared/utils/phone.util';
import { formatFullName } from '../../../shared/utils/user.util';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationItemsDialog } from '../../../shared/dialogs/application-items-dialog/application-items-dialog';

@Component({
  selector: 'app-profile-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PublicHeader,
    StatusBadge,
    Pagination,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly currentUser = this.currentUserService.currentUser;

  readonly applicationsResponse = signal<PaginatedResponse<UserApplication> | null>(null);
  readonly isLoadingUser = signal(false);
  readonly isLoadingApplications = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly limit = signal(5);

  readonly isAdmin = computed(() => {
    return this.currentUser()?.roles.includes('admin') ?? false;
  });

  readonly fullName = computed(() => {
    const user = this.currentUser();

    return user ? formatFullName(user) : '';
  });

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadApplications();
  }

  loadCurrentUser(): void {
    this.errorMessage.set('');
    this.isLoadingUser.set(true);

    this.currentUserService
      .loadCurrentUser()
      .pipe(
        finalize(() => {
          this.isLoadingUser.set(false);
        }),
      )
      .subscribe({
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
          this.logout();
        },
      });
  }

  loadApplications(): void {
    this.errorMessage.set('');
    this.isLoadingApplications.set(true);

    this.applicationsService
      .getMyApplications({
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(
        finalize(() => {
          this.isLoadingApplications.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.applicationsResponse.set(response);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  openApplicationItemsDialog(application: UserApplication): void {
    this.dialog.open(ApplicationItemsDialog, {
      data: {
        application,
      },
      width: 'min(752px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      panelClass: ['app-dialog-panel', 'application-items-dialog-panel'],
      backdropClass: 'application-items-dialog-backdrop',
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadApplications();
  }

  logout(): void {
    this.authService.logout();
    this.currentUserService.clearCurrentUser();
    this.router.navigateByUrl('/');
  }

  goToCreateApplication(): void {
    this.router.navigateByUrl('/profile/applications/new');
  }

  formatDate(value: string | null): string {
    return formatDate(value);
  }

  formatPhone(value: string): string {
    return formatUkrainianPhoneInput(value);
  }

  formatApplicationNumber(application: UserApplication): string {
    return formatApplicationNumber(application);
  }

  formatApplicationItems(application: UserApplication): string {
    return formatApplicationItemsShort(application);
  }

  formatApplicationFulfillment(application: UserApplication): string {
    return formatApplicationFulfillment(application);
  }
}
