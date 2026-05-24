import { IsPhoneNumber } from 'class-validator';

export class SignInRequestDto {
  @IsPhoneNumber('UA')
  phone!: string;
}
