import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { environment } from '../../../../environments/environment';
import { ItemCategory } from '../../../core/models/item-category.model';
import { InventoryItem, ItemUnit } from '../../../core/models/item.model';
import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemsService } from '../../../core/services/items.service';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { AddItemCategoryDialog } from '../add-item-category-dialog/add-item-category-dialog';

export interface UpdateItemDialogData {
  item: InventoryItem;
}

@Component({
  selector: 'app-update-item-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-item-dialog.html',
  styleUrl: './update-item-dialog.scss',
})
export class UpdateItemDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UpdateItemDialog>);
  private readonly dialog = inject(MatDialog);
  private readonly itemsService = inject(ItemsService);
  private readonly itemCategoriesService = inject(ItemCategoriesService);

  readonly data = inject<UpdateItemDialogData>(MAT_DIALOG_DATA);

  readonly categories = signal<ItemCategory[]>([]);
  readonly isLoadingCategories = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly units: ItemUnit[] = ['шт', 'уп'];

  readonly form = this.fb.group({
    categoryId: [this.data.item.category.id, [Validators.required, Validators.min(1)]],
    name: [this.data.item.name, [Validators.required]],
    unit: [this.data.item.unit as ItemUnit, [Validators.required]],
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
      .updateAdminInventoryItem(this.data.item.id, {
        name: value.name,
        categoryId: value.categoryId,
        unit: value.unit,
      })
      .subscribe({
        next: (updatedItem) => {
          this.dialogRef.close(updatedItem);
        },
        error: (error) => {
          if (environment.useItemUpdateMockFallback) {
            this.dialogRef.close(this.buildMockUpdatedItem());
            return;
          }

          this.isSubmitting.set(false);
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  private buildMockUpdatedItem(): InventoryItem {
    const value = this.form.getRawValue();

    const selectedCategory = this.categories().find(
      (category) => category.id === value.categoryId,
    );

    return {
      ...this.data.item,
      name: value.name,
      unit: value.unit,
      category: selectedCategory ?? this.data.item.category,
      updatedAt: new Date().toISOString(),
    };
  }
}