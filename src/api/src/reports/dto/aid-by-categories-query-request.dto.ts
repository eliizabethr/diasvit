import { IsDateString, IsOptional } from 'class-validator';

export class AidByCategoriesQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
