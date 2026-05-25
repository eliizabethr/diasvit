import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';

import { AdminApplication } from '../../../core/models/application.model';
import { ApplicationsService } from '../../../core/services/applications.service';
import { UsersService } from '../../../core/services/users.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatApplicationNumber } from '../../../shared/utils/application.util';
import { formatDate } from '../../../shared/utils/date.util';
import { formatFullName } from '../../../shared/utils/user.util';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, RouterLink, MatButtonModule, StatusBadge],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.scss',
})
export class AdminDashboardPage implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly applicationsService = inject(ApplicationsService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly usersTotal = signal(0);
  readonly applicationsTotal = signal(0);
  readonly newApplicationsTotal = signal(0);
  readonly recentNewApplications = signal<AdminApplication[]>([]);

  readonly hasRecentApplications = computed(() => {
    return this.recentNewApplications().length > 0;
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    forkJoin({
      users: this.usersService.getAdminUsers({ page: 1, limit: 1 }),
      applications: this.applicationsService.getAdminApplications({ page: 1, limit: 1 }),
      newApplications: this.applicationsService.getAdminApplications({
        page: 1,
        limit: 1,
        statuses: 'new',
      }),
      recentNewApplications: this.applicationsService.getAdminApplications({
        page: 1,
        limit: 8,
        statuses: 'new',
        orderBy: 'createdAt',
      }),
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.usersTotal.set(response.users.total);
          this.applicationsTotal.set(response.applications.total);
          this.newApplicationsTotal.set(response.newApplications.total);
          this.recentNewApplications.set(response.recentNewApplications.data);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  formatApplicationNumber(application: AdminApplication): string {
    return formatApplicationNumber(application);
  }

  formatDate(value: string): string {
    return formatDate(value);
  }

  formatUserFullName(application: AdminApplication): string {
    return formatFullName(application.user);
  }
}