import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { UserAdminResponseDto } from './user-admin-response.dto';

export class PaginatedUsersAdminResponseDto extends PaginatedResponseDto(
  UserAdminResponseDto,
) {}
