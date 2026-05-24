import {
  IsDateString,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserRequestDto {
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
}
