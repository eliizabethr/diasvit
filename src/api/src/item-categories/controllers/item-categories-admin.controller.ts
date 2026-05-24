import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateItemCategoryAdminRequestDto } from '../dto/admin/create-item-category-admin-request.dto';
import { ItemCategoryAdminResponseDto } from '../dto/admin/item-category-admin-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ItemCategoriesService } from '../item-categories.service';
import { AuthGuard } from '../../auth/auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginatedItemCategoriesAdminResponseDto } from '../dto/admin/paginated-item-categories-admin-response.dto';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/item-categories')
export class ItemCategoriesAdminController {
  constructor(private readonly itemCategoriesService: ItemCategoriesService) {}

  @ApiOperation({ summary: 'Create a new aid item category.' })
  @ApiCreatedResponse({ type: ItemCategoryAdminResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() body: CreateItemCategoryAdminRequestDto,
  ): Promise<ItemCategoryAdminResponseDto> {
    const itemCategory = await this.itemCategoriesService.create(body.name);

    return {
      id: itemCategory.id,
      name: itemCategory.name,
    };
  }

  @ApiOperation({ summary: 'Get all aid item categories.' })
  @ApiOkResponse({ type: PaginatedItemCategoriesAdminResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedItemCategoriesAdminResponseDto> {
    const result = await this.itemCategoriesService.findAll(
      query.page !== undefined ? Number(query.page) : undefined,
      query.limit !== undefined ? Number(query.limit) : undefined,
    );

    return {
      data: result.data.map((itemCategory) => ({
        id: itemCategory.id,
        name: itemCategory.name,
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}
