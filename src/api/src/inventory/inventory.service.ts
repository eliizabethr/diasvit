import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemCategory } from '../item-categories/entities/item-category.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import {
  InventoryOperation,
  InventoryOperationType,
} from './entities/inventory-operation.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}

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

    const itemsQb = this.dataSource
      .getRepository(Item)
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
      OR category.searchName LIKE :search
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

    const orderColumn = orderMap[orderBy];

    itemsQb
      .orderBy(orderColumn, orderDirection.toUpperCase() as 'ASC' | 'DESC')
      .offset(offset)
      .limit(limit);

    const countQb = this.dataSource
      .getRepository(Item)
      .createQueryBuilder('item')
      .leftJoin('item.category', 'category');

    if (search) {
      itemsQb.andWhere(
        `(
      item.searchName LIKE :search
      OR category.searchName LIKE :search
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

  // async addIncome(
  //   itemId: number,
  //   quantity: number,
  //   performedByUserId: number,
  //   comment?: string,
  // ) {
  //   return await this.createOperation(
  //     itemId,
  //     InventoryOperationType.INCOME,
  //     quantity,
  //     performedByUserId,
  //     comment,
  //     undefined,
  //   );
  // }

  // async useStock(
  //   itemId: number,
  //   quantity: number,
  //   applicationId: number,
  //   performedByUserId: number,
  //   comment?: string,
  // ) {
  //   return await this.createOperation(
  //     itemId,
  //     InventoryOperationType.USAGE,
  //     quantity,
  //     performedByUserId,
  //     comment,
  //     applicationId,
  //   );
  // }

  // async correctIncrease(
  //   itemId: number,
  //   quantity: number,
  //   performedByUserId: number,
  //   comment?: string,
  // ) {
  //   return this.createOperation(
  //     itemId,
  //     InventoryOperationType.CORRECTION_INCREASE,
  //     quantity,
  //     performedByUserId,
  //     comment,
  //   );
  // }

  // async correctDecrease(
  //   itemId: number,
  //   quantity: number,
  //   performedByUserId: number,
  //   comment?: string,
  // ) {
  //   return this.createOperation(
  //     itemId,
  //     InventoryOperationType.CORRECTION_DECREASE,
  //     quantity,
  //     performedByUserId,
  //     comment,
  //   );
  // }

  async getCurrentStock(itemId: number): Promise<number> {
    const latestOperation = await this.dataSource
      .getRepository(InventoryOperation)
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
    // TODO: maybe remove, if it's called from controller?
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
      stockBefore,
      stockAfter,
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
    const [inventoryOperations, total] = await this.dataSource
      .getRepository(InventoryOperation)
      .findAndCount({
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
