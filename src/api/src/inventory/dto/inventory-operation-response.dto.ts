import { InventoryItemResponseDto } from './inventory-item-response.dto';

export class InventoryOperationResponseDto {
  id!: number;
  itemId!: number;
  // item!: InventoryItemResponseDto;
  type!: 'income' | 'usage' | 'correction_increase' | 'correction_decrease';
  quantity!: number;
  stockBefore!: number;
  stockAfter!: number;
  performedByUserId!: number;
  applicationId!: number | null;
  comment!: string | null;
  createdAt!: Date;
}
