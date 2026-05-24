import { IsEnum, IsOptional } from 'class-validator';

// export class UpdateApplicationRequestDto extends PartialType(OmitType(CreateApplicationRequestDto, ['items'] as const)) { }

// export enum ApplicationStatusDto {
//   NEW = 'new',
//   IN_REVIEW = 'in_review',
//   APPROVED = 'approved',
//   REJECTED = 'rejected',
//   PREPARING = 'preparing',
//   READY_FOR_DELIVERY = 'ready_for_delivery',
//   READY_FOR_PICKUP = 'ready_for_pickup',
//   SHIPPED = 'shipped',
//   COMPLETED = 'completed',
//   CANCELLED = 'cancelled',
// }

export class UpdateApplicationAdminRequestDto {
  // @IsOptional()
  // @IsEnum(ApplicationStatusDto)
  // status?: ApplicationStatusDto;
}
