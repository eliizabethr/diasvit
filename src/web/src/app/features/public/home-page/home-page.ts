import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { UserItem } from '../../../core/models/item.model';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { ApplicationForm } from '../../../shared/components/application-form/application-form';
import { ApplicationSuccessDialog } from '../../../shared/dialogs/application-success-dialog/application-success-dialog';
import {
  SmsVerificationDialog,
  SmsVerificationDialogResult,
} from '../../../shared/dialogs/sms-verification-dialog/sms-verification-dialog';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import {
  buildAidApplicationPayload,
  createAidApplicationForm,
  createAidApplicationItemGroup,
  formatAidApplicationDateOfBirth,
  parseAidApplicationDateOfBirth,
  setAidApplicationContactFieldsDisabled,
  updateAidApplicationDeliveryValidators,
} from '../../../shared/utils/application-form.util';
import { formatFullName } from '../../../shared/utils/user.util';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ApplicationForm,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly itemsService = inject(ItemsService);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly dialog = inject(MatDialog);

  readonly currentUser = this.currentUserService.currentUser;

  readonly items = signal<UserItem[]>([]);
  readonly isLoadingItems = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = createAidApplicationForm(this.fb);

  ngOnInit(): void {
    this.loadItems();
    this.tryLoadCurrentUser();

    this.form.controls.fulfillmentType.valueChanges.subscribe((type) => {
      updateAidApplicationDeliveryValidators(this.form, type);
    });

    updateAidApplicationDeliveryValidators(
      this.form,
      this.form.controls.fulfillmentType.value,
    );
  }

  ngAfterViewInit(): void {
    const sectionId = window.location.hash.slice(1);

    if (!sectionId) {
      return;
    }

    window.setTimeout(() => {
      this.scrollToSectionById(sectionId);
    });
  }

  scrollToApplicationForm(): void {
    this.scrollToSectionById('application');
  }

  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.scrollToSectionById(sectionId);
    window.history.pushState(null, '', `#${sectionId}`);
  }

  private scrollToSectionById(sectionId: string): void {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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
    setAidApplicationContactFieldsDisabled(this.form, false);
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
      dateOfBirth: parseAidApplicationDateOfBirth(user.dateOfBirth),
      phone: user.phone,
    });

    setAidApplicationContactFieldsDisabled(this.form, true);
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
        title: 'Введіть код підтвердження',
        subtitle: 'Код із SMS надіслано на номер',
      },
      width: 'min(620px, calc(100vw - 24px))',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100vh - 24px)',
      panelClass: ['app-dialog-panel', 'sms-verification-dialog-panel'],
      disableClose: true,
      autoFocus: 'first-tabbable',
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
          dateOfBirth: formatAidApplicationDateOfBirth(formValue.dateOfBirth),
        },
        verificationToken,
      )
      .pipe(
        switchMap(() => this.currentUserService.loadCurrentUser()),
        switchMap(() =>
          this.applicationsService.createMyApplication(
            buildAidApplicationPayload(this.form),
          ),
        ),
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.openApplicationSuccessDialog();
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private createApplication(): void {
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
          this.openApplicationSuccessDialog();
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private openApplicationSuccessDialog(): void {
    this.dialog.open(ApplicationSuccessDialog, {
      width: 'min(1060px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 64px)',
      panelClass: ['app-dialog-panel', 'application-success-dialog-panel'],
      backdropClass: 'application-success-dialog-backdrop',
      disableClose: true,
      autoFocus: false,
    });
  }

  getCurrentUserName(): string {
    const user = this.currentUser();

    return user ? formatFullName(user) : '';
  }
}
