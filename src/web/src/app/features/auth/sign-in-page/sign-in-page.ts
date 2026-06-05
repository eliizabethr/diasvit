import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
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
import { environment } from '../../../../environments/environment';
import {
  formatUkrainianPhoneInput,
  normalizeUkrainianPhoneDigits,
  ukrainianPhoneValidator,
} from '../../../shared/utils/phone.util';

@Component({
  selector: 'app-sign-in-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthLayout,
    OtpCodeInput,
  ],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.scss',
})
export class SignInPage implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    phone: [
      '',
      [
        Validators.required,
        ukrainianPhoneValidator(),
      ],
    ],
    code: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
      ],
    ],
  });

  readonly codeRequested = signal(false);
  readonly isRequestingCode = signal(false);
  readonly isSigningIn = signal(false);

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
        purpose: 'sign_in',
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

  signIn(): void {
    this.errorMessage.set('');
    this.codeMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { code } = this.form.getRawValue();
    const phone = normalizeUkrainianPhoneDigits(this.form.controls.phone.value);

    this.isSigningIn.set(true);

    const signInRequest$ = environment.smsVerificationEnabled
      ? this.authService.verifyCode({ phone, code, purpose: 'sign_in' }).pipe(
        switchMap((response) => this.authService.signIn({ phone }, response.token)),
      )
      : this.authService.signIn({ phone }, '');

    signInRequest$
      .pipe(
        finalize(() => {
          this.isSigningIn.set(false);
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

  private moveCursorToEnd(input: HTMLInputElement): void {
    const cursorPosition = input.value.length;

    try {
      input.setSelectionRange(cursorPosition, cursorPosition);
    } catch {
      // Some input implementations do not support manual cursor placement.
    }
  }
}
