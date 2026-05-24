import { IsEnum, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyCodeRequestDto {
  @IsPhoneNumber('UA')
  phone!: string;

  @IsString()
  @Length(6)
  code!: string;

  @IsEnum(['register', 'sign_in'])
  purpose!: 'register' | 'sign_in';
}
