import { AdminUser } from './user.model';

export type FulfillmentType = 'delivery' | 'pickup';

export type ApplicationStatus =
  | 'new'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'preparing'
  | 'ready_for_delivery'
  | 'ready_for_pickup'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface CreateApplicationItemRequest {
  itemId: number;
  quantity: number;
}

export interface CreateApplicationRequest {
  items: CreateApplicationItemRequest[];
  fulfillmentType: FulfillmentType;
  deliveryCity?: string;
  deliveryAddress?: string;
  pickupLocation?: string;
  pickupDate?: string;
  comment?: string;
}

export interface UserApplicationItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface AdminApplicationItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export class ApplicationUser {
  phone!: string;
  firstName!: string;
  middleName!: string;
  lastName!: string;
}

export interface UserApplication {
  id: number;
  items: UserApplicationItem[];
  fulfillmentType: FulfillmentType;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  pickupLocation: string | null;
  pickupDate: string | null;
  createdAt: string;
  updatedAt: string;
  comment: string | null;
  status: ApplicationStatus;
}

export interface AdminApplication {
  id: number;
  items: AdminApplicationItem[];
  fulfillmentType: FulfillmentType;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  pickupLocation: string | null;
  pickupDate: string | null;
  createdAt: string;
  updatedAt: string;
  comment: string | null;
  status: ApplicationStatus;
  user: ApplicationUser;
}

export interface UpdateApplicationAdminRequest { }

export interface ChangeApplicationStatusRequest {
  status: ApplicationStatus;
  comment?: string;
}

export type AdminApplicationsOrderBy = 'createdAt' | 'status';

export interface MyApplicationsQueryParams {
  page?: number;
  limit?: number;
}

export interface AdminApplicationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: string;
  orderBy?: AdminApplicationsOrderBy;
  categoryIds?: string;
  fulfillmentType?: FulfillmentType;
}