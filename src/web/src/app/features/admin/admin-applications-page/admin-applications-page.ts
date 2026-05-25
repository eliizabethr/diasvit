import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  AdminApplication,
  ApplicationStatus,
  FulfillmentType,
} from '../../../core/models/application.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { APPLICATION_STATUS_LABELS } from '../../../core/models/ui-labels';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ApplicationItemsDialog } from '../../../shared/dialogs/application-items-dialog/application-items-dialog';
import { ApplicationCommentDialog } from '../../../shared/dialogs/application-comment-dialog/application-comment-dialog';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import {
  formatApplicationFulfillment,
  formatApplicationItemsShort,
  formatApplicationNumber,
} from '../../../shared/utils/application.util';
import { formatDate } from '../../../shared/utils/date.util';
import { formatFullName } from '../../../shared/utils/user.util';
import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemCategory } from '../../../core/models/item-category.model';
import { canTransitionToStatus } from '../../../core/models/application-status-transitions';

@Component({
  selector: 'app-admin-applications-page',
  imports: [
    Pagination,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './admin-applications-page.html',
  styleUrl: './admin-applications-page.scss',
})
export class AdminApplicationsPage implements OnInit, OnDestroy {
  private readonly applicationsService = inject(ApplicationsService);
  private readonly itemCategoriesService = inject(ItemCategoriesService);
  private readonly dialog = inject(MatDialog);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusesControl = new FormControl<ApplicationStatus[]>([], { nonNullable: true });
  readonly categoryIdsControl = new FormControl<number[]>([], { nonNullable: true });
  readonly fulfillmentTypeControl = new FormControl<FulfillmentType | ''>('', { nonNullable: true });

  readonly applicationsResponse = signal<PaginatedResponse<AdminApplication> | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly limit = signal(8);
  readonly categories = signal<ItemCategory[]>([]);

  readonly statuses = Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({
    value: value as ApplicationStatus,
    label,
  }));

  private searchSubscription?: Subscription;
  private statusesSubscription?: Subscription;
  private categoryIdsSubscription?: Subscription;
  private fulfillmentTypeSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCategories();
    this.loadApplications();

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadApplications();
      });

    this.statusesSubscription = this.statusesControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadApplications();
      });

    this.categoryIdsSubscription = this.categoryIdsControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadApplications();
      });

    this.fulfillmentTypeSubscription = this.fulfillmentTypeControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadApplications();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.statusesSubscription?.unsubscribe();
    this.categoryIdsSubscription?.unsubscribe();
    this.fulfillmentTypeSubscription?.unsubscribe();
  }

  loadApplications(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const selectedCategoryIds = this.categoryIdsControl.value;
    const selectedStatuses = this.statusesControl.value;

    this.applicationsService
      .getAdminApplications({
        page: this.page(),
        limit: this.limit(),
        search: this.searchControl.value.trim() || undefined,
        statuses: selectedStatuses.length
          ? selectedStatuses.join(',')
          : undefined,
        fulfillmentType: this.fulfillmentTypeControl.value || undefined,
        categoryIds: selectedCategoryIds.length
          ? selectedCategoryIds.join(',')
          : undefined,
        orderBy: 'createdAt',
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
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

  loadCategories(): void {
    this.itemCategoriesService
      .getAdminItemCategories({
        page: 1,
        limit: 100,
      })
      .subscribe({
        next: (response) => {
          this.categories.set(response.data);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusesControl.setValue([], { emitEvent: false });
    this.categoryIdsControl.setValue([], { emitEvent: false });
    this.fulfillmentTypeControl.setValue('', { emitEvent: false });

    this.page.set(1);
    this.loadApplications();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadApplications();
  }

  updateStatus(application: AdminApplication, newStatus: ApplicationStatus): void {
    if (application.status === newStatus) {
      return;
    }

    if (!canTransitionToStatus(application.status, newStatus)) {
      return;
    }

    this.errorMessage.set('');

    const previousStatus = application.status;
    application.status = newStatus;

    this.applicationsService
      .changeAdminApplicationStatus(application.id, { status: newStatus })
      .subscribe({
        next: (updatedApplication) => {
          this.replaceApplication(updatedApplication);
        },
        error: (error) => {
          application.status = previousStatus;
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  openItemsDialog(application: AdminApplication): void {
    this.dialog.open(ApplicationItemsDialog, {
      data: {
        application,
      },
      width: '680px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
    });
  }

  openCommentDialog(application: AdminApplication): void {
    if (!application.comment) {
      return;
    }

    this.dialog.open(ApplicationCommentDialog, {
      data: {
        title: `Коментар до заявки ${this.formatApplicationNumber(application)}`,
        comment: application.comment,
      },
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
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

  formatApplicationItems(application: AdminApplication): string {
    return formatApplicationItemsShort(application);
  }

  formatApplicationFulfillment(application: AdminApplication): string {
    return formatApplicationFulfillment(application);
  }

  getStatusLabel(status: ApplicationStatus): string {
    return APPLICATION_STATUS_LABELS[status];
  }

  canSelectStatus(application: AdminApplication, status: ApplicationStatus): boolean {
    return canTransitionToStatus(application.status, status);
  }

  private replaceApplication(updatedApplication: AdminApplication): void {
    const response = this.applicationsResponse();

    if (!response) {
      return;
    }

    this.applicationsResponse.set({
      ...response,
      data: response.data.map((application) =>
        application.id === updatedApplication.id ? updatedApplication : application,
      ),
    });
  }
}