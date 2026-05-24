import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { InventoryOperationResponseDto } from './inventory-operation-response.dto';

export class PaginatedInventoryOperationsResponseDto extends PaginatedResponseDto(
  InventoryOperationResponseDto,
) {}
