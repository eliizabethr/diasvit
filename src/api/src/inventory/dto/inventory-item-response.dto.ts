import { ItemCategoryAdminResponseDto } from '../../item-categories/dto/admin/item-category-admin-response.dto';

export class InventoryItemResponseDto {
  id!: number;
  name!: string;
  currentStock!: number;
  category!: ItemCategoryAdminResponseDto;
  unit!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
