import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemCategory } from '../item-categories/entities/item-category.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import {
  InventoryOperation,
  InventoryOperationType,
} from './entities/inventory-operation.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(InventoryOperation)
    private readonly inventoryOperationRepository: Repository<InventoryOperation>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemCategory)
    private readonly itemCategoryRepository: Repository<ItemCategory>,
  ) {}

  async createItem(
    performedByUserId: number,
    name: string,
    categoryId: number,
    unit: string,
    initialQuantity: number,
    comment?: string,
  ): Promise<Item> {
    return await this.dataSource.transaction(async (manager) => {
      const category = await manager.findOne(ItemCategory, {
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Item category not found');
      }

      const item = manager.create(Item, {
        name: name,
        searchName: this.normalizeSearchText(name),
        category: category,
        unit: unit,
        currentStock: initialQuantity,
      });

      const savedItem = await manager.save(Item, item);

      const initialOperation = manager.create(InventoryOperation, {
        itemId: savedItem.id,
        type: InventoryOperationType.INCOME,
        quantity: initialQuantity,
        stockBefore: 0,
        stockAfter: initialQuantity,
        performedByUserId: performedByUserId,
        comment: comment ?? 'Перша поставка допомоги',
      });

      await manager.save(InventoryOperation, initialOperation);

      return savedItem;
    });
  }

  async findAllItems(
    search?: string,
    categoryIds?: number[],
    orderBy: 'name' | 'categoryName' | 'currentStock' = 'name',
    orderDirection: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Item>> {
    const offset = (page - 1) * limit;

    const itemsQb = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category')
      .select('item.id', 'id')
      .addSelect('item.name', 'name')
      .addSelect('item.unit', 'unit')
      .addSelect('item.currentStock', 'currentStock')
      .addSelect('item.createdAt', 'createdAt')
      .addSelect('item.updatedAt', 'updatedAt')
      .addSelect('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.searchName', 'categorySearchName');

    if (search) {
      itemsQb.andWhere(
        `(
      item.searchName LIKE :search
    )`,
        {
          search: `%${this.normalizeSearchText(search)}%`,
        },
      );
    }

    if (categoryIds?.length) {
      itemsQb.andWhere('item.categoryId IN (:...categoryIds)', {
        // TODO: check
        categoryIds: categoryIds,
      });
    }

    const orderMap: Record<'name' | 'categoryName' | 'currentStock', string> = {
      name: 'item.name',
      categoryName: 'category.name',
      currentStock: 'item.currentStock',
    };

    const order = orderDirection.toUpperCase() as 'ASC' | 'DESC';

    itemsQb.orderBy(orderMap[orderBy], order).offset(offset).limit(limit);

    const countQb = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category');

    if (search) {
      itemsQb.andWhere(
        `(
      item.searchName LIKE :search
    )`,
        {
          search: `%${this.normalizeSearchText(search)}%`,
        },
      );
    }

    if (categoryIds?.length) {
      countQb.andWhere('item.categoryId IN (:...categoryIds)', {
        categoryIds: categoryIds,
      });
    }

    const [rows, total] = await Promise.all([
      itemsQb.getRawMany(),
      countQb.getCount(),
    ]);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        searchName: row.searchName,
        categoryId: Number(row.categoryId),
        category: {
          id: Number(row.categoryId),
          name: row.categoryName,
          searchName: row.categorySearchName,
          items: [], // not needed at the moment
        },
        unit: row.unit,
        currentStock: Number(row.currentStock),
        inventoryOperations: [], // not needed at the moment
        applicationItems: [], // not needed at the moment
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateItem(
    itemId: number,
    input: {
      name?: string;
      unit?: 'шт' | 'уп';
      categoryId?: number;
    },
  ): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (
      input.name === undefined &&
      input.unit === undefined &&
      input.categoryId === undefined
    ) {
      throw new BadRequestException('No item fields provided for update');
    }

    if (input.categoryId !== undefined) {
      const categoryExists = await this.itemCategoryRepository.exists({
        where: { id: input.categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException('Item category not found');
      }

      item.categoryId = input.categoryId;
    }

    if (input.name !== undefined) {
      item.name = input.name;
      item.searchName = this.normalizeSearchText(input.name);
    }

    if (input.unit !== undefined) {
      item.unit = input.unit;
    }

    await this.itemRepository.save(item);

    const updatedItem = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: {
        category: true,
      },
    });

    return updatedItem!;
  }

  async getCurrentStock(itemId: number): Promise<number> {
    const latestOperation = await this.inventoryOperationRepository
      .createQueryBuilder('operation')
      .where('operation.itemId = :itemId', { itemId })
      .orderBy('operation.id', 'DESC')
      .getOne();

    if (!latestOperation) {
      throw new NotFoundException('Inventory operation for item not found');
    }

    return latestOperation.stockAfter;
  }

  async createOperationForItem(
    performedByUserId: number,
    itemId: number,
    operationType: InventoryOperationType,
    quantity: number,
    comment?: string,
    applicationId?: number,
    applicationItemId?: number,
  ): Promise<InventoryOperation> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    return await this.dataSource.transaction(async (manager) => {
      return await this.createOperationForItemInTransaction(manager, {
        performedByUserId: performedByUserId,
        itemId: itemId,
        operationType: operationType,
        quantity: quantity,
        comment: comment,
        applicationId: applicationId,
        applicationItemId: applicationItemId,
      });
    });
  }

  async createOperationForItemInTransaction(
    manager: EntityManager,
    input: {
      performedByUserId: number;
      itemId: number;
      operationType: InventoryOperationType;
      quantity: number;
      comment?: string;
      applicationId?: number;
      applicationItemId?: number;
    },
  ): Promise<InventoryOperation> {
    if (input.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const stockDelta = this.getStockDelta(input.operationType, input.quantity);

    // locking the Item first for everyone else
    const updateQb = manager
      .createQueryBuilder()
      .update(Item)
      .set({
        currentStock: () => `currentStock + (${stockDelta})`,
      })
      .where('id = :itemId', { itemId: input.itemId });

    if (stockDelta < 0) {
      updateQb.andWhere('currentStock >= :quantity', {
        // avoid negative currentStock
        quantity: input.quantity,
      });
    }

    const updateResult = await updateQb.execute();

    if (updateResult.affected !== 1) {
      throw new BadRequestException(
        'Item not found or not enough items in stock',
      );
    }

    const updatedItem = await manager.findOne(Item, {
      where: { id: input.itemId },
    });

    const stockAfter = updatedItem!.currentStock;
    const stockBefore = stockAfter - stockDelta;

    const operation = manager.create(InventoryOperation, {
      itemId: input.itemId,
      type: input.operationType,
      quantity: input.quantity,
      stockBefore: stockBefore,
      stockAfter: stockAfter,
      applicationId: input.applicationId,
      applicationItemId: input.applicationItemId,
      performedByUserId: input.performedByUserId,
      comment: input.comment,
    });

    const savedOperation = await manager.save(InventoryOperation, operation);

    const operationWithItem = await manager.findOne(InventoryOperation, {
      where: { id: savedOperation.id },
      relations: {
        item: {
          category: true,
        },
      },
    });

    return operationWithItem!;
  }

  async findAllOperationsByForItem(
    itemId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<InventoryOperation>> {
    const [inventoryOperations, total] =
      await this.inventoryOperationRepository.findAndCount({
        where: {
          item: { id: itemId },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          id: 'desc',
        },
        relations: {
          item: {
            category: true,
          },
        },
      });

    return {
      data: inventoryOperations,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getStockDelta(
    operationType: InventoryOperationType,
    quantity: number,
  ): number {
    switch (operationType) {
      case InventoryOperationType.INCOME:
      case InventoryOperationType.RETURN:
      case InventoryOperationType.CORRECTION_INCREASE:
        return quantity;

      case InventoryOperationType.USAGE:
      case InventoryOperationType.CORRECTION_DECREASE:
        return -quantity;
    }
  }

  // TODO: extract to utils
  private normalizeSearchText(value: string): string {
    return value.trim().toLocaleLowerCase('uk-UA').normalize('NFC');
  }
}
