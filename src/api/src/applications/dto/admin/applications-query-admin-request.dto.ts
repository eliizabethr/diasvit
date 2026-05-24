import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ApplicationsQueryAdminRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    'new',
    'in_review',
    'approved',
    'rejected',
    'preparing',
    'ready_for_delivery',
    'ready_for_pickup',
    'shipped',
    'completed',
    'cancelled',
  ])
  status?:
    | 'new'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'preparing'
    | 'ready_for_delivery'
    | 'ready_for_pickup'
    | 'shipped'
    | 'completed'
    | 'cancelled';

  @IsOptional()
  @IsIn(['createdAt', 'status'])
  orderBy?: 'createdAt' | 'status';
}
