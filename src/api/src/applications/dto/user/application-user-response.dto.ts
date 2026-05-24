import { ApplicationItemUserResponseDto } from './application-item-user-response.dto';

export class ApplicationUserResponseDto {
  id!: number;
  items!: ApplicationItemUserResponseDto[];
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
}
