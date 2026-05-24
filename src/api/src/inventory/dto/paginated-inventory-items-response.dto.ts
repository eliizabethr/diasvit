import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { InventoryItemResponseDto } from './inventory-item-response.dto';

export class PaginatedInventoryItemsResponseDto extends PaginatedResponseDto(
  InventoryItemResponseDto,
) {}
