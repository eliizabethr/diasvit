import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  InventoryItem,
  InventoryOperation,
  InventoryOperationType,
} from '../../../core/models/item.model';
import { ItemsService } from '../../../core/services/items.service';
import { getApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-inventory-operation-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './inventory-operation-dialog.html',
  styleUrl: './inventory-operation-dialog.scss',
})
export class InventoryOperationDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InventoryOperationDialog>);
  private readonly itemsService = inject(ItemsService);

  readonly items = signal<InventoryItem[]>([]);
  readonly isLoadingItems = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly operationTypes: Array<{ value: InventoryOperationType; label: string }> = [
    {
      value: 'income',
      label: 'Нова поставка',
    },
    {
      value: 'correction_increase',
      label: 'Коригування: збільшення',
    },
    {
      value: 'correction_decrease',
      label: 'Коригування: зменшення',
    },
  ];

  readonly form = this.fb.group({
    itemId: [0, [Validators.required, Validators.min(1)]],
    type: ['income' as InventoryOperationType, [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    comment: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.loadItems();
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.isSubmitting.set(true);

    this.itemsService
      .createInventoryOperation(value.itemId, {
        type: value.type,
        quantity: value.quantity,
        comment: value.comment,
      })
      .subscribe({
        next: (operation: InventoryOperation) => {
          this.dialogRef.close(operation);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private loadItems(): void {
    this.isLoadingItems.set(true);

    this.itemsService
      .getAdminInventoryItems({
        page: 1,
        limit: 100,
        orderBy: 'name',
        orderDirection: 'asc',
      })
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.isLoadingItems.set(false);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
          this.isLoadingItems.set(false);
        },
      });
  }
}