import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ItemsService } from '../items.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PaginatedItemsUserResponseDto } from '../dto/user/paginated-items-user-response.dto';

@Controller('items')
export class ItemsUserController {
  constructor(private readonly itemsService: ItemsService) {}

  @ApiOperation({ summary: 'Get all aid items' })
  @ApiOkResponse({ type: PaginatedItemsUserResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedItemsUserResponseDto> {
    const result = await this.itemsService.findAll(
      query.page !== undefined ? Number(query.page) : undefined,
      query.limit !== undefined ? Number(query.limit) : undefined,
    );

    return {
      data: result.data.map((item) => ({
        id: item.id,
        name: item.name,
        category: {
          id: item.category.id,
          name: item.category.name,
        },
        unit: item.unit,
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}
