import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ApplicationAdminResponseDto } from './application-admin-response.dto';

export class PaginatedApplicationsAdminResponseDto extends PaginatedResponseDto(
  ApplicationAdminResponseDto,
) {}
