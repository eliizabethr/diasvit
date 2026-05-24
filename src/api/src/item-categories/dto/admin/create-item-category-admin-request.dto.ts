import { IsString, MinLength } from 'class-validator';

export class CreateItemCategoryAdminRequestDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
