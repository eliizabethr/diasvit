import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/auth/auth.service';
import { VerificationPurpose } from '../../../core/models/auth.model';
import { OtpCodeInput } from '../../components/otp-code-input/otp-code-input';
import { getApiErrorMessage } from '../../utils/api-error.util';

export interface SmsVerificationDialogData {
  phone: string;
  purpose: VerificationPurpose;
  title?: string;
  subtitle?: string;
}

export interface SmsVerificationDialogResult {
  token: string;
}

@Component({
  selector: 'app-sms-verification-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    OtpCodeInput,
  ],
  templateUrl: './sms-verification-dialog.html',
  styleUrl: './sms-verification-dialog.scss',
})
export class SmsVerificationDialog implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<SmsVerificationDialog>);
  readonly data = inject<SmsVerificationDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  readonly isVerifying = signal(false);
  readonly isResending = signal(false);
  readonly errorMessage = signal('');
  readonly infoMessage = signal('Код підтвердження надіслано на вказаний номер.');
  readonly resendSecondsLeft = signal(30);

  private resendTimerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startResendTimer();
  }

  ngOnDestroy(): void {
    this.clearResendTimer();
  }

  close(): void {
    this.dialogRef.close();
  }

  verifyCode(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isVerifying.set(true);

    this.authService
      .verifyCode({
        phone: this.data.phone,
        code: this.form.controls.code.value,
        purpose: this.data.purpose,
      })
      .pipe(
        finalize(() => {
          this.isVerifying.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.dialogRef.close({
            token: response.token,
          } satisfies SmsVerificationDialogResult);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  resendCode(): void {
    if (this.resendSecondsLeft() > 0 || this.isResending()) {
      return;
    }

    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isResending.set(true);

    this.authService
      .requestCode({
        phone: this.data.phone,
        purpose: this.data.purpose,
      })
      .pipe(
        finalize(() => {
          this.isResending.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.form.controls.code.setValue('');
          this.infoMessage.set('Новий код підтвердження надіслано.');
          this.startResendTimer();
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
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