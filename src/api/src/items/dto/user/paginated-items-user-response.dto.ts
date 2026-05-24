import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ItemUserResponseDto } from './item-user-response.dto';

export class PaginatedItemsUserResponseDto extends PaginatedResponseDto(
  ItemUserResponseDto,
) {}
