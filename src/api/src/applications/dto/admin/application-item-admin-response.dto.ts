import { InventoryItemResponseDto } from 'src/inventory/dto/inventory-item-response.dto';

export class ApplicationItemAdminResponseDto {
  id!: number;
  item!: InventoryItemResponseDto;
  quantity!: number;
}
