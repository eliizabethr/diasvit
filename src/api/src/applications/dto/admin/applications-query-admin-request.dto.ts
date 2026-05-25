import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Transform } from 'class-transformer';

export class ApplicationsQueryAdminRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number).filter((x) => !Number.isNaN(x));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((x) => !Number.isNaN(x));
    }

    return undefined;
  })
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').map((x) => x.trim());
    }

    return undefined;
  })
  @IsArray()
  @IsIn(
    [
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
    ],
    { each: true },
  )
  statuses?: (
    | 'new'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'preparing'
    | 'ready_for_delivery'
    | 'ready_for_pickup'
    | 'shipped'
    | 'completed'
    | 'cancelled'
  )[];

  @IsOptional()
  @IsIn(['delivery', 'pickup'])
  fulfillmentType?: 'delivery' | 'pickup';

  @IsOptional()
  @IsIn(['createdAt', 'fullName', 'phone', 'status'])
  orderBy?: 'createdAt' | 'fullName' | 'phone' | 'status' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'asc';
}
