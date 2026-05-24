import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryItemRequestDto {
  @IsString()
  name!: string;

  @IsInt()
  categoryId!: number;

  @IsString()
  @IsIn(['шт', 'уп'])
  unit!: 'шт' | 'уп';

  @IsInt()
  @Min(0)
  initialQuantity!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
