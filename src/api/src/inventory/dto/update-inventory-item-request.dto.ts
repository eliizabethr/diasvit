import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateInventoryItemRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['шт', 'уп'])
  unit?: 'шт' | 'уп';

  @IsOptional()
  @IsInt()
  categoryId?: number;
}
