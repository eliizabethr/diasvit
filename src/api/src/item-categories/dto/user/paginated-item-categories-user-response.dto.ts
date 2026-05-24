import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ItemCategoryUserResponseDto } from './item-category-user-response.dto';

export class PaginatedItemCategoriesUserResponseDto extends PaginatedResponseDto(
  ItemCategoryUserResponseDto,
) {}
