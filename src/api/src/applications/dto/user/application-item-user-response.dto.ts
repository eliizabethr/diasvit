import { ItemUserResponseDto } from '../../../items/dto/user/item-user-response.dto';

export class ApplicationItemUserResponseDto {
  id!: number;
  item!: ItemUserResponseDto;
  quantity!: number;
}
