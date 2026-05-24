import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateApplicationItemUserRequestDto } from './create-application-item-user-request.dto';

export class CreateApplicationUserRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateApplicationItemUserRequestDto)
  items!: CreateApplicationItemUserRequestDto[];

  // TODO: maybe use enum
  @IsIn(['delivery', 'pickup'])
  fulfillmentType!: 'delivery' | 'pickup';

  // TODO: check conditional optional
  @IsOptional()
  @IsString()
  deliveryCity?: string;

  // TODO: check conditional optional
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  // TODO: check conditional optional
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  // TODO: check conditional optional
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
