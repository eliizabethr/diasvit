export class UserUserResponseDto {
  id!: number; // TODO: check, maybe not needed in response
  phone!: string;
  firstName!: string;
  middleName!: string;
  lastName!: string;
  dateOfBirth!: string;
  roles!: ('user' | 'admin')[];
}
