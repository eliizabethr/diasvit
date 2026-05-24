import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ItemCategory } from '../../../core/models/item-category.model';
import { InventoryItem, InventoryOperation } from '../../../core/models/item.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemsService } from '../../../core/services/items.service';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { AddItemDialog } from '../../../shared/dialogs/add-item-dialog/add-item-dialog';
import { UpdateItemDialog } from '../../../shared/dialogs/update-item-dialog/update-item-dialog';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { InventoryOperationDialog } from '../../../shared/dialogs/inventory-operation-dialog/inventory-operation-dialog';

@Component({
  selector: 'app-admin-items-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    Pagination,
  ],
  templateUrl: './admin-items-page.html',
  styleUrl: './admin-items-page.scss',
})
export class AdminItemsPage implements OnInit, OnDestroy {
  private readonly itemsService = inject(ItemsService);
  private readonly itemCategoriesService = inject(ItemCategoriesService);
  private readonly dialog = inject(MatDialog);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categoryIdsControl = new FormControl<number[]>([], { nonNullable: true });

  readonly itemsResponse = signal<PaginatedResponse<InventoryItem> | null>(null);
  readonly categories = signal<ItemCategory[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly limit = signal(9);

  private searchSubscription?: Subscription;
  private categoryIdsSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadItems();
      });

    this.categoryIdsSubscription = this.categoryIdsControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadItems();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.categoryIdsSubscription?.unsubscribe();
  }

  loadCategories(): void {
    this.itemCategoriesService.getAdminItemCategories({ page: 1, limit: 100 }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (error) => {
        this.errorMessage.set(getApiErrorMessage(error));
      },
    });
  }

  loadItems(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const selectedCategoryIds = this.categoryIdsControl.value;

    this.itemsService
      .getAdminInventoryItems({
        page: this.page(),
        limit: this.limit(),
        search: this.searchControl.value.trim() || undefined,
        categoryIds: selectedCategoryIds.length ? selectedCategoryIds.join(',') : undefined,
        orderBy: 'name',
        orderDirection: 'asc',
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.itemsResponse.set(response);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryIdsControl.setValue([], { emitEvent: false });
    this.page.set(1);
    this.loadItems();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadItems();
  }

  openAddItemDialog(): void {
    const dialogRef = this.dialog.open(AddItemDialog, {
      width: '680px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((item: InventoryItem | undefined) => {
      if (!item) {
        return;
      }

      this.loadCategories();
      this.loadItems();
    });
  }

  openUpdateItemDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open(UpdateItemDialog, {
      data: {
        item,
      },
      width: '680px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((updatedItem: InventoryItem | undefined) => {
      if (!updatedItem) {
        return;
      }

      this.replaceItem(updatedItem);
      this.loadCategories();
    });
  }

  openInventoryOperationDialog(): void {
    const dialogRef = this.dialog.open(InventoryOperationDialog, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'app-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((operation: InventoryOperation | undefined) => {
      if (!operation) {
        return;
      }

      this.loadItems();
    });
  }

  private replaceItem(updatedItem: InventoryItem): void {
    const response = this.itemsResponse();

    if (!response) {
      return;
    }

    this.itemsResponse.set({
      ...response,
      data: response.data.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    });
  }
}