import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Transform } from 'class-transformer';

export class InventoryItemsQueryRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
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
  @IsIn(['name', 'categoryName', 'currentStock'])
  orderBy?: 'name' | 'categoryName' | 'currentStock' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'asc';
}
