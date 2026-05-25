import { Injectable } from '@nestjs/common';
import {
  InventoryOperation,
  InventoryOperationType,
} from '../inventory/entities/inventory-operation.entity';
import { DataSource } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getAidByCategories(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{
    dateFrom?: string;
    dateTo?: string;
    data: {
      categoryId: number;
      categoryName: string;
      receivedQuantity: number;
      issuedQuantity: number;
      currentStock: number;
    }[];
  }> {
    const operationsQb = this.dataSource
      .getRepository(InventoryOperation)
      .createQueryBuilder('operation')
      .innerJoin('operation.item', 'item')
      .innerJoin('item.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect(
        `
        SUM(
          CASE
            WHEN operation.type IN (:...incomeTypes)
            THEN operation.quantity
            ELSE 0
          END
        )
        `,
        'receivedQuantity',
      )
      .addSelect(
        `
        SUM(
          CASE
            WHEN operation.type IN (:...usageTypes)
            THEN operation.quantity
            ELSE 0
          END
        )
        `,
        'issuedQuantity',
      )
      .groupBy('category.id')
      .addGroupBy('category.name')
      .setParameters({
        incomeTypes: [
          InventoryOperationType.INCOME,
          InventoryOperationType.CORRECTION_INCREASE,
        ],
        usageTypes: [
          InventoryOperationType.USAGE,
          InventoryOperationType.CORRECTION_DECREASE,
        ],
      });

    if (dateFrom) {
      operationsQb.andWhere('operation.createdAt >= :dateFrom', {
        dateFrom,
      });
    }

    if (dateTo) {
      operationsQb.andWhere('operation.createdAt <= :dateTo', {
        dateTo,
      });
    }

    const stockQb = this.dataSource
      .getRepository(Item)
      .createQueryBuilder('item')
      .innerJoin('item.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('SUM(item.currentStock)', 'currentStock')
      .groupBy('category.id');

    const [operationRows, stockRows] = await Promise.all([
      operationsQb.getRawMany(),
      stockQb.getRawMany(),
    ]);

    const stockByCategoryId = new Map<number, number>();

    for (const row of stockRows) {
      stockByCategoryId.set(
        Number(row.categoryId),
        Number(row.currentStock ?? 0),
      );
    }

    return {
      dateFrom,
      dateTo,
      data: operationRows.map((row) => {
        const categoryId = Number(row.categoryId);

        return {
          categoryId,
          categoryName: row.categoryName as string,
          receivedQuantity: Number(row.receivedQuantity ?? 0),
          issuedQuantity: Number(row.issuedQuantity ?? 0),
          currentStock: stockByCategoryId.get(categoryId) ?? 0,
        };
      }),
    };
  }

  async exportAidByCategories(dateFrom?: string, dateTo?: string) {
    const report = await this.getAidByCategories(dateFrom, dateTo);

    const records = report.data.map((item) => ({
      categoryName: item.categoryName,
      receivedQuantity: item.receivedQuantity,
      issuedQuantity: item.issuedQuantity,
      currentStock: item.currentStock,
    }));

    return stringify(records, {
      header: true,
      bom: true,
      columns: [
        { key: 'categoryName', header: 'Категорія' },
        { key: 'receivedQuantity', header: 'Надійшло' },
        { key: 'issuedQuantity', header: 'Видано' },
        { key: 'currentStock', header: 'Залишок' },
      ],
      delimiter: ',',
    });
  }
}
