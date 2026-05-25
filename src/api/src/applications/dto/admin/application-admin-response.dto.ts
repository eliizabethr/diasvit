export class ApplicationAdminResponseDto {
  id!: number;
  items!: ApplicationItemDto[];
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
  user!: ApplicationUserDto;
}

export class ApplicationItemDto {
  id!: number;
  name!: string;
  quantity!: number;
  unit!: string;
}

export class ApplicationUserDto {
  phone!: string;
  firstName!: string;
  middleName!: string;
  lastName!: string;
}
