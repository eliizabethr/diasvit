import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ItemCategoryAdminResponseDto } from './item-category-admin-response.dto';

export class PaginatedItemCategoriesAdminResponseDto extends PaginatedResponseDto(
  ItemCategoryAdminResponseDto,
) {}
