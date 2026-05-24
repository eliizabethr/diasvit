import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ApplicationUserResponseDto } from './application-user-response.dto';

export class PaginatedApplicationsUserResponseDto extends PaginatedResponseDto(
  ApplicationUserResponseDto,
) {}
