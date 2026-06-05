import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { OtpCodeInput } from '../../../shared/components/otp-code-input/otp-code-input';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { environment } from '../../../../environments/environment';
import {
  formatUkrainianPhoneInput,
  normalizeUkrainianPhoneDigits,
  ukrainianPhoneValidator,
} from '../../../shared/utils/phone.util';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthLayout,
    OtpCodeInput,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'uk-UA' },
    provideNativeDateAdapter(),
  ],
})
export class RegisterPage implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: new FormControl<Date | null>(null, [Validators.required]),
    phone: ['', [Validators.required, ukrainianPhoneValidator()]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  readonly codeRequested = signal(false);
  readonly isRequestingCode = signal(false);
  readonly isRegistering = signal(false);

  readonly errorMessage = signal('');
  readonly codeMessage = signal('');

  readonly resendSecondsLeft = signal(0);

  private resendTimerId: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.clearResendTimer();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedPhone = formatUkrainianPhoneInput(input.value);

    this.form.controls.phone.setValue(formattedPhone);
    input.value = formattedPhone;
    this.moveCursorToEnd(input);
  }

  requestCode(): void {
    this.errorMessage.set('');
    this.codeMessage.set('');

    const phoneControl = this.form.controls.phone;

    if (phoneControl.invalid) {
      phoneControl.markAsTouched();
      return;
    }

    if (!environment.smsVerificationEnabled) {
      this.codeRequested.set(true);
      this.form.controls.code.setValue('000000');
      this.codeMessage.set('SMS-перевірку вимкнено.');
      return;
    }

    this.isRequestingCode.set(true);

    this.authService
      .requestCode({
        phone: normalizeUkrainianPhoneDigits(phoneControl.value),
        purpose: 'register',
      })
      .pipe(
        finalize(() => {
          this.isRequestingCode.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.codeRequested.set(true);
          this.form.controls.code.setValue('');
          this.codeMessage.set('Код підтвердження надіслано на вказаний номер.');
          this.startResendTimer();
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  register(): void {
    this.errorMessage.set('');
    this.codeMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const phone = normalizeUkrainianPhoneDigits(formValue.phone);
    const dateOfBirth = this.formatDateOfBirth(formValue.dateOfBirth);

    this.isRegistering.set(true);

    const registerRequest$ = environment.smsVerificationEnabled
      ? this.authService.verifyCode({
        phone,
        code: formValue.code,
        purpose: 'register',
      }).pipe(
        switchMap((response) =>
          this.authService.register(
            {
              phone,
              firstName: formValue.firstName,
              middleName: formValue.middleName,
              lastName: formValue.lastName,
              dateOfBirth,
            },
            response.token,
          )
        )
      )
      : this.authService.register(
        {
          phone,
          firstName: formValue.firstName,
          middleName: formValue.middleName,
          lastName: formValue.lastName,
          dateOfBirth,
        },
        '');

    registerRequest$
      .pipe(
        finalize(() => {
          this.isRegistering.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/profile');
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  canResendCode(): boolean {
    return this.codeRequested() && this.resendSecondsLeft() === 0 && !this.isRequestingCode();
  }

  private startResendTimer(): void {
    this.clearResendTimer();

    this.resendSecondsLeft.set(30);

    this.resendTimerId = setInterval(() => {
      const nextValue = this.resendSecondsLeft() - 1;

      if (nextValue <= 0) {
        this.resendSecondsLeft.set(0);
        this.clearResendTimer();
        return;
      }

      this.resendSecondsLeft.set(nextValue);
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendTimerId) {
      clearInterval(this.resendTimerId);
      this.resendTimerId = null;
    }
  }

  private formatDateOfBirth(value: Date | null): string {
    if (!value) {
      return '';
    }

    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${value.getFullYear()}-${month}-${day}`;
  }

  private moveCursorToEnd(input: HTMLInputElement): void {
    const cursorPosition = input.value.length;

    try {
      input.setSelectionRange(cursorPosition, cursorPosition);
    } catch {
      // Some input implementations do not support manual cursor placement.
    }
  }
}
