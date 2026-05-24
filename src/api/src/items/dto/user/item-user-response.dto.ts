import { ItemCategoryUserResponseDto } from 'src/item-categories/dto/user/item-category-user-response.dto';

export class ItemUserResponseDto {
  id!: number;
  name!: string;
  category!: ItemCategoryUserResponseDto;
  unit!: string;
}
