import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { UserItem } from '../../../core/models/item.model';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatDate } from '../../../shared/utils/date.util';
import { formatFullName } from '../../../shared/utils/user.util';
import { FulfillmentType } from '../../../core/models/application.model';

@Component({
  selector: 'app-create-application-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
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

  readonly form = this.fb.group({
    fullName: [{ value: '', disabled: true }],
    phone: [{ value: '', disabled: true }],
    dateOfBirth: [{ value: '', disabled: true }],

    fulfillmentType: ['pickup', [Validators.required]],
    deliveryCity: [''],
    deliveryAddress: [''],
    pickupLocation: ['Запоріжжя'],
    comment: [''],

    items: this.fb.array([this.createItemGroup()]),
  });

  get applicationItems(): FormArray {
    return this.form.controls.items;
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadItems();

    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      this.updateDeliveryValidators(type);
    });

    this.updateDeliveryValidators(this.form.controls.fulfillmentType.value);
  }

  addItem(): void {
    this.applicationItems.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.applicationItems.length === 1) {
      return;
    }

    this.applicationItems.removeAt(index);
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    this.isSubmitting.set(true);

    this.applicationsService
      .createMyApplication({
        fulfillmentType: formValue.fulfillmentType as FulfillmentType,
        deliveryCity:
          formValue.fulfillmentType === 'delivery' ? formValue.deliveryCity : undefined,
        deliveryAddress:
          formValue.fulfillmentType === 'delivery' ? formValue.deliveryAddress : undefined,
        pickupLocation:
          formValue.fulfillmentType === 'pickup' ? formValue.pickupLocation : undefined,
        comment: formValue.comment || undefined,
        items: formValue.items.map((item) => ({
          itemId: Number(item.itemId),
          quantity: Number(item.quantity),
        })),
      })
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
      fullName: formatFullName(user),
      phone: user.phone,
      dateOfBirth: formatDate(user.dateOfBirth),
    });
  }

  private createItemGroup() {
    return this.fb.group({
      itemId: [0, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private updateDeliveryValidators(type: string): void {
    const deliveryCityControl = this.form.controls.deliveryCity;
    const deliveryAddressControl = this.form.controls.deliveryAddress;

    if (type === 'delivery') {
      deliveryCityControl.setValidators([Validators.required]);
      deliveryAddressControl.setValidators([Validators.required]);
    } else {
      deliveryCityControl.clearValidators();
      deliveryAddressControl.clearValidators();
      deliveryCityControl.setValue('');
      deliveryAddressControl.setValue('');
    }

    deliveryCityControl.updateValueAndValidity();
    deliveryAddressControl.updateValueAndValidity();
  }
}