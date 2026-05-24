import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ItemCategoriesService } from '../item-categories.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PaginatedItemCategoriesUserResponseDto } from '../dto/user/paginated-item-categories-user-response.dto';

@Controller('item-categories')
export class ItemCategoriesUserController {
  constructor(private readonly itemCategoriesService: ItemCategoriesService) {}

  @ApiOperation({ summary: 'Get all aid item categories.' })
  @ApiOkResponse({ type: PaginatedItemCategoriesUserResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedItemCategoriesUserResponseDto> {
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
