import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemCategory } from '../../../core/models/item-category.model';
import { getApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-add-item-category-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-item-category-dialog.html',
  styleUrl: './add-item-category-dialog.scss',
})
export class AddItemCategoryDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddItemCategoryDialog>);
  private readonly itemCategoriesService = inject(ItemCategoriesService);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.itemCategoriesService.createAdminItemCategory(this.form.getRawValue()).subscribe({
      next: (category: ItemCategory) => {
        this.dialogRef.close(category);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(getApiErrorMessage(error));
      },
    });
  }
}