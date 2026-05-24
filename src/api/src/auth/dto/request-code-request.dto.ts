import { IsEnum, IsPhoneNumber } from 'class-validator';

export class RequestCodeRequestDto {
  @IsPhoneNumber('UA')
  phone!: string;

  @IsEnum(['register', 'sign_in'])
  purpose!: 'register' | 'sign_in';
}
