import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryOperationRequestDto {
  @IsIn(['income', 'correction_increase', 'correction_decrease'])
  type!: 'income' | 'correction_increase' | 'correction_decrease';

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
