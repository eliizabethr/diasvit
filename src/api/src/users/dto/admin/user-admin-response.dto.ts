export class UserAdminResponseDto {
  id!: number;
  phone!: string;
  firstName!: string;
  middleName!: string;
  lastName!: string;
  dateOfBirth!: string;
  applicationsCount!: number;
  roles!: ('user' | 'admin')[];
}
