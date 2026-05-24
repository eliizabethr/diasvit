import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import {
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { UserItem } from '../../../core/models/item.model';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import {
  SmsVerificationDialog,
  SmsVerificationDialogResult,
} from '../../../shared/dialogs/sms-verification-dialog/sms-verification-dialog';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatDate } from '../../../shared/utils/date.util';
import { formatFullName } from '../../../shared/utils/user.util';
import { FulfillmentType } from '../../../core/models/application.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  @ViewChild('applicationFormSection')
  private readonly applicationFormSection?: ElementRef<HTMLElement>;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly itemsService = inject(ItemsService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly currentUser = this.currentUserService.currentUser;

  readonly items = signal<UserItem[]>([]);
  readonly isLoadingItems = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?380\d{9}$/)]],

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
    this.loadItems();
    this.tryLoadCurrentUser();

    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      this.updateDeliveryValidators(type);
    });

    this.updateDeliveryValidators(this.form.controls.fulfillmentType.value);
  }

  scrollToApplicationForm(): void {
    this.applicationFormSection?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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

  submitApplication(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.currentUser()) {
      this.createApplication();
      return;
    }

    this.registerOrSignInAndCreateApplication();
  }

  logout(): void {
    this.authService.logout();
    this.currentUserService.clearCurrentUser();
  }

  private tryLoadCurrentUser(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (this.currentUser()) {
      this.prefillUserFields();
      return;
    }

    this.currentUserService.loadCurrentUser().subscribe({
      next: () => {
        this.prefillUserFields();
      },
      error: () => {
        this.authService.logout();
        this.currentUserService.clearCurrentUser();
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
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
    });

    this.form.controls.lastName.disable();
    this.form.controls.firstName.disable();
    this.form.controls.middleName.disable();
    this.form.controls.dateOfBirth.disable();
    this.form.controls.phone.disable();
  }

  private loadItems(): void {
    this.isLoadingItems.set(true);

    this.itemsService
      .getItems({
        page: 1,
        limit: 100,
      })
      .pipe(
        finalize(() => {
          this.isLoadingItems.set(false);
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

  private registerOrSignInAndCreateApplication(): void {
    const formValue = this.form.getRawValue();

    if (!environment.smsVerificationEnabled) {
      this.finishRegistrationAndCreateApplication('');
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .requestCode({
        phone: formValue.phone,
        purpose: 'register',
      })
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.openSmsDialog();
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private openSmsDialog(): void {
    const formValue = this.form.getRawValue();

    const dialogRef = this.dialog.open(SmsVerificationDialog, {
      data: {
        phone: formValue.phone,
        purpose: 'register',
        title: 'Підтвердження заявки',
        subtitle: 'Введіть SMS-код, щоб підтвердити номер телефону та надіслати заявку.',
      },
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: SmsVerificationDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.finishRegistrationAndCreateApplication(result.token);
    });
  }

  private finishRegistrationAndCreateApplication(verificationToken: string): void {
    const formValue = this.form.getRawValue();

    this.isSubmitting.set(true);

    this.authService
      .register(
        {
          phone: formValue.phone,
          firstName: formValue.firstName,
          middleName: formValue.middleName,
          lastName: formValue.lastName,
          dateOfBirth: formValue.dateOfBirth,
        },
        verificationToken,
      )
      .pipe(
        switchMap(() => this.currentUserService.loadCurrentUser()),
        switchMap(() => this.applicationsService.createMyApplication(this.buildApplicationPayload())),
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

  private createApplication(): void {
    this.isSubmitting.set(true);

    this.applicationsService
      .createMyApplication(this.buildApplicationPayload())
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

  private buildApplicationPayload() {
    const formValue = this.form.getRawValue();

    return {
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
    };
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

  getCurrentUserName(): string {
    const user = this.currentUser();

    return user ? formatFullName(user) : '';
  }

  getCurrentUserBirthDate(): string {
    const user = this.currentUser();

    return user ? formatDate(user.dateOfBirth) : '';
  }
}