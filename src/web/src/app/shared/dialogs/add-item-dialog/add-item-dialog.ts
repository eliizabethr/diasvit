import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ItemCategory } from '../../../core/models/item-category.model';
import { InventoryItem, ItemUnit } from '../../../core/models/item.model';
import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemsService } from '../../../core/services/items.service';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { AddItemCategoryDialog } from '../add-item-category-dialog/add-item-category-dialog';

@Component({
  selector: 'app-add-item-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-item-dialog.html',
  styleUrl: './add-item-dialog.scss',
})
export class AddItemDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddItemDialog>);
  private readonly dialog = inject(MatDialog);
  private readonly itemsService = inject(ItemsService);
  private readonly itemCategoriesService = inject(ItemCategoriesService);

  readonly categories = signal<ItemCategory[]>([]);
  readonly isLoadingCategories = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly units: ItemUnit[] = ['шт', 'уп'];

  readonly form = this.fb.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required]],
    unit: ['шт' as ItemUnit, [Validators.required]],
    initialQuantity: [1, [Validators.required, Validators.min(1)]],
    comment: [''],
  });

  constructor() {
    this.loadCategories();
  }

  close(): void {
    this.dialogRef.close();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);

    this.itemCategoriesService.getAdminItemCategories({ page: 1, limit: 100 }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error) => {
        this.errorMessage.set(getApiErrorMessage(error));
        this.isLoadingCategories.set(false);
      },
    });
  }

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(AddItemCategoryDialog, {
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((createdCategory: ItemCategory | undefined) => {
      if (!createdCategory) {
        return;
      }

      this.categories.update((categories) => [...categories, createdCategory]);
      this.form.controls.categoryId.setValue(createdCategory.id);
    });
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
      .createAdminInventoryItem({
        name: value.name,
        categoryId: value.categoryId,
        unit: value.unit,
        initialQuantity: value.initialQuantity,
        comment: value.comment || undefined,
      })
      .subscribe({
        next: (item: InventoryItem) => {
          this.dialogRef.close(item);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }
}