import { UserAdminResponseDto } from '../../../users/dto/admin/user-admin-response.dto';
import { ApplicationItemAdminResponseDto } from './application-item-admin-response.dto';

export class ApplicationAdminResponseDto {
  id!: number;
  items!: ApplicationItemAdminResponseDto[];
  fulfillmentType!: 'delivery' | 'pickup'; // TODO: make an enum
  deliveryCity!: string | null;
  deliveryAddress!: string | null;
  pickupLocation!: string | null;
  pickupDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  comment!: string | null;
  status!:
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
  user!: UserAdminResponseDto;
}
