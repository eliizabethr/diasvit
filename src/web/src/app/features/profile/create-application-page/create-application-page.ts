import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { UserItem } from '../../../core/models/item.model';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { ApplicationForm } from '../../../shared/components/application-form/application-form';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import {
  buildAidApplicationPayload,
  createAidApplicationForm,
  createAidApplicationItemGroup,
  parseAidApplicationDateOfBirth,
  setAidApplicationContactFieldsDisabled,
  updateAidApplicationDeliveryValidators,
} from '../../../shared/utils/application-form.util';
import { formatFullName } from '../../../shared/utils/user.util';

@Component({
  selector: 'app-create-application-page',
  imports: [CommonModule, RouterLink, ApplicationForm],
  templateUrl: './create-application-page.html',
  styleUrl: './create-application-page.scss',
})
export class CreateApplicationPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly itemsService = inject(ItemsService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly router = inject(Router);

  readonly currentUser = this.currentUserService.currentUser;

  readonly items = signal<UserItem[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = createAidApplicationForm(this.fb);

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadItems();

    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      updateAidApplicationDeliveryValidators(this.form, type);
    });

    updateAidApplicationDeliveryValidators(
      this.form,
      this.form.controls.fulfillmentType.value,
    );
  }

  addItem(): void {
    this.form.controls.items.push(createAidApplicationItemGroup(this.fb));
  }

  removeItem(index: number): void {
    if (this.form.controls.items.length === 1) {
      return;
    }

    this.form.controls.items.removeAt(index);
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.applicationsService
      .createMyApplication(buildAidApplicationPayload(this.form))
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/application-success');
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  getCurrentUserName(): string {
    const user = this.currentUser();

    return user ? formatFullName(user) : '';
  }

  private loadCurrentUser(): void {
    const existingUser = this.currentUser();

    if (existingUser) {
      this.prefillUserFields();
      return;
    }

    this.currentUserService.loadCurrentUser().subscribe({
      next: () => {
        this.prefillUserFields();
      },
      error: (error) => {
        this.errorMessage.set(getApiErrorMessage(error));
      },
    });
  }

  private loadItems(): void {
    this.isLoading.set(true);

    this.itemsService
      .getItems({
        page: 1,
        limit: 100,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private prefillUserFields(): void {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    this.form.patchValue({
      lastName: user.lastName,
      firstName: user.firstName,
      middleName: user.middleName,
      dateOfBirth: parseAidApplicationDateOfBirth(user.dateOfBirth),
      phone: user.phone,
    });

    setAidApplicationContactFieldsDisabled(this.form, true);
  }
}
