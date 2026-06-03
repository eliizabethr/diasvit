import { ItemCategory } from './item-category.model';

export type ItemUnit = 'шт' | 'уп';

export interface UserItem {
  id: number;
  name: string;
  category: ItemCategory;
  unit: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  currentStock: number;
  category: ItemCategory;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  categoryId: number;
  unit: ItemUnit;
  initialQuantity: number;
  comment?: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  unit?: ItemUnit;
  categoryId?: number;
}

export type InventoryOperationType =
  | 'income'
  | 'correction_increase'
  | 'correction_decrease';

export interface CreateInventoryOperationRequest {
  type: InventoryOperationType;
  quantity: number;
  comment?: string;
}

export interface InventoryOperation {
  id: number;
  itemId: number;
  type: InventoryOperationType | 'usage';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  performedByUserId: number;
  applicationId: number | null;
  comment: string | null;
  createdAt: string;
}

export type AdminInventoryItemsOrderBy = 'name' | 'categoryName' | 'currentStock';
export type OrderDirection = 'asc' | 'desc';

export interface AdminInventoryItemsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: string;
  orderBy?: AdminInventoryItemsOrderBy;
  orderDirection?: OrderDirection;
}