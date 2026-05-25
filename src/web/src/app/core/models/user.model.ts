export type UserRole = 'user' | 'admin';

export interface CurrentUser {
  id: number;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  roles: UserRole[];
}

export interface AdminUser {
  id: number;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  applicationsCount: number;
  roles: UserRole[];
}

export interface CreateAdminUserRequest {
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  roles: UserRole[];
}

export type AdminUsersOrderBy = 'fullName' | 'phone' | 'age' | 'applicationsCount';
export type OrderDirection = 'asc' | 'desc';

export interface AdminUsersQueryParams {
  search?: string;
  orderBy?: AdminUsersOrderBy;
  orderDirection?: OrderDirection;
  page?: number;
  limit?: number;
}