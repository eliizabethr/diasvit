import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { UserItem } from '../../../core/models/item.model';
import { AidApplicationForm } from '../../utils/application-form.util';

@Component({
  selector: 'app-application-form',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'uk-UA' },
    provideNativeDateAdapter(),
  ],
})
export class ApplicationForm {
  readonly form = input.required<AidApplicationForm>();
  readonly items = input.required<UserItem[]>();
  readonly isLoadingItems = input(false);
  readonly isSubmitting = input(false);
  readonly errorMessage = input('');
  readonly currentUserName = input('');
  readonly cancelLink = input<string | null>(null);
  readonly submitLabel = input('Надіслати заявку');
  readonly submittingLabel = input('Надсилання...');

  readonly submitted = output<void>();
  readonly addItem = output<void>();
  readonly removeItem = output<number>();

  readonly applicationItems = computed(() => {
    return this.form().controls.items;
  });
}
