import { IsDefined, IsInt, IsPositive } from 'class-validator';

export class CreateApplicationItemUserRequestDto {
  @IsDefined()
  itemId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
