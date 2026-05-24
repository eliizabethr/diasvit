import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Item>> {
    const [items, total] = await this.itemsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        name: 'asc',
      },
      relations: {
        category: true,
      },
    });

    return {
      data: items,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: number): Promise<Item> {
    // TODO: if not admin, don't return qantity in stock

    const item = await this.itemsRepository.findOne({
      where: { id: id },
      relations: {
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }
}
