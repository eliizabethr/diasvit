import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class UsersQueryAdminRequestDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['phone', 'lastName', 'dateOfBirth'])
  orderBy?: 'phone' | 'lastName' | 'dateOfBirth'; // TODO: use User's properties
}
