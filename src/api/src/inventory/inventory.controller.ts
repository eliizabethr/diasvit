import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemRequestDto } from './dto/create-inventory-item-request.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { PaginatedInventoryItemsResponseDto } from './dto/paginated-inventory-items-response.dto';
import { InventoryItemsQueryRequestDto } from './dto/inventory-items-query-request.dto';
import { CreateInventoryOperationRequestDto } from './dto/create-inventory-operation-request.dto';
import { InventoryOperationResponseDto } from './dto/inventory-operation-response.dto';
import { InventoryOperationType } from './entities/inventory-operation.entity';
import { PaginatedInventoryOperationsResponseDto } from './dto/paginated-inventory-operations-response.dto';
import { InventoryOperationsQueryRequestDto } from './dto/inventory-operationss-query-request.dto';
import { UpdateInventoryItemRequestDto } from './dto/update-inventory-item-request.dto';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/inventory/items')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Create a new inventory item.' })
  @ApiCreatedResponse({ type: InventoryItemResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Request() request,
    @Body() body: CreateInventoryItemRequestDto,
  ): Promise<InventoryItemResponseDto> {
    const inventoryItem = await this.inventoryService.createItem(
      request.user.sub,
      body.name,
      body.categoryId,
      body.unit,
      body.initialQuantity,
      body.comment,
    );

    return {
      id: inventoryItem.id,
      name: inventoryItem.name,
      currentStock: inventoryItem.currentStock,
      category: {
        id: inventoryItem.category.id,
        name: inventoryItem.category.name,
      },
      unit: inventoryItem.unit,
      createdAt: inventoryItem.createdAt,
      updatedAt: inventoryItem.updatedAt,
    };
  }

  @ApiOperation({ summary: 'Get all inventory items.' })
  @ApiOkResponse({ type: PaginatedInventoryItemsResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: InventoryItemsQueryRequestDto,
  ): Promise<PaginatedInventoryItemsResponseDto> {
    const result = await this.inventoryService.findAllItems(
      query.search,
      query.categoryIds,
      query.orderBy,
      query.orderDirection,
      query.page,
      query.limit,
    );

    return {
      data: result.data.map((item) => ({
        id: item.id,
        name: item.name,
        currentStock: item.currentStock,
        category: {
          id: item.category.id,
          name: item.category.name,
        },
        unit: item.unit,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  @Patch(':itemId')
  async updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateInventoryItemRequestDto,
  ): Promise<InventoryItemResponseDto> {
    const updatedItem = await this.inventoryService.updateItem(itemId, {
      name: body.name,
      unit: body.unit,
      categoryId: body.categoryId,
    });

    return {
      id: updatedItem.id,
      name: updatedItem.name,
      currentStock: updatedItem.currentStock,
      category: {
        id: updatedItem.category.id,
        name: updatedItem.category.name,
      },
      unit: updatedItem.unit,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
    };
  }

  // @Get(':itemId')
  // async getById(@Param('itemId') itemId: number) {}

  // @Get(':itemId')
  // async getCurrentStockById(@Param('itemId') itemId: number) { }

  @ApiOperation({ summary: 'Create a new inventory item operation.' })
  @ApiCreatedResponse({ type: InventoryOperationResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post(':itemId/operations')
  async createOperationByItemId(
    @Request() request,
    @Param('itemId') itemId: number,
    @Body() body: CreateInventoryOperationRequestDto,
  ): Promise<InventoryOperationResponseDto> {
    const inventoryOperation =
      await this.inventoryService.createOperationForItem(
        request.user.sub,
        itemId,
        body.type as InventoryOperationType,
        body.quantity,
        body.comment,
      );

    return {
      id: inventoryOperation.id,
      itemId: inventoryOperation.itemId,
      type: inventoryOperation.type,
      quantity: inventoryOperation.quantity,
      stockBefore: inventoryOperation.stockBefore,
      stockAfter: inventoryOperation.stockAfter,
      performedByUserId: inventoryOperation.performedByUserId,
      applicationId: inventoryOperation.applicationId,
      comment: inventoryOperation.comment,
      createdAt: inventoryOperation.createdAt,
    };
  }

  @ApiOperation({ summary: 'Get an inventory item operation by operation ID.' })
  @ApiOkResponse({ type: PaginatedInventoryOperationsResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get(':itemId/operations')
  async getOperationsByItemId(
    @Param('itemId') itemId: number,
    @Query() query: InventoryOperationsQueryRequestDto,
  ): Promise<PaginatedInventoryOperationsResponseDto> {
    const result = await this.inventoryService.findAllOperationsByForItem(
      itemId,
      query.page,
      query.limit,
    );

    return {
      data: result.data.map((operation) => ({
        id: operation.id,
        itemId: operation.itemId,
        type: operation.type,
        quantity: operation.quantity,
        stockBefore: operation.stockBefore,
        stockAfter: operation.stockAfter,
        performedByUserId: operation.performedByUserId,
        applicationId: operation.applicationId,
        comment: operation.comment,
        createdAt: operation.createdAt,
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}
