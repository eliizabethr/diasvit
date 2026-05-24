import { Component, OnDestroy, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { OtpCodeInput } from '../../../shared/components/otp-code-input/otp-code-input';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthLayout,
    OtpCodeInput,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?380\d{9}$/)]],
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

  requestCode(): void {
    this.errorMessage.set('');
    this.codeMessage.set('');

    const phoneControl = this.form.controls.phone;

    if (phoneControl.invalid) {
      phoneControl.markAsTouched();
      return;
    }

    this.isRequestingCode.set(true);

    this.authService
      .requestCode({
        phone: phoneControl.value,
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

    this.isRegistering.set(true);

    this.authService
      .verifyCode({
        phone: formValue.phone,
        code: formValue.code,
        purpose: 'register',
      })
      .pipe(
        switchMap((response) => {
          return this.authService.register(
            {
              phone: formValue.phone,
              firstName: formValue.firstName,
              middleName: formValue.middleName,
              lastName: formValue.lastName,
              dateOfBirth: formValue.dateOfBirth,
            },
            response.token,
          );
        }),
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
}