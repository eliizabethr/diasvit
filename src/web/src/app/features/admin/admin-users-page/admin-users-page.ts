import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AdminUser } from '../../../core/models/user.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { UsersService } from '../../../core/services/users.service';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatDate } from '../../../shared/utils/date.util';
import { calculateAge, formatFullName } from '../../../shared/utils/user.util';

@Component({
  selector: 'app-admin-users-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    Pagination,
  ],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.scss',
})
export class AdminUsersPage implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly usersResponse = signal<PaginatedResponse<AdminUser> | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly limit = signal(8);

  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.page.set(1);
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  loadUsers(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.usersService
      .getAdminUsers({
        page: this.page(),
        limit: this.limit(),
        search: this.searchControl.value.trim() || undefined,
        orderBy: 'fullName',
        orderDirection: 'asc',
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.usersResponse.set(response);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadUsers();
  }

  formatUserFullName(user: AdminUser): string {
    return formatFullName(user);
  }

  // TODO: maybe extract to utils, maybe use a lib
  formatPhone(phone: string): string {
    return '+' + phone;
  }

  formatDate(value: string): string {
    return formatDate(value);
  }

  calculateAge(value: string): number {
    return calculateAge(value);
  }
}