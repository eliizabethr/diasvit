import {
  ArrayNotEmpty,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserAdminRequestDto {
  @IsPhoneNumber('UA')
  phone!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  middleName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @ArrayNotEmpty()
  @IsEnum(['user', 'admin'], { each: true })
  roles!: ('user' | 'admin')[];
}
