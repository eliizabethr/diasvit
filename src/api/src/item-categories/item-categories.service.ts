import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemCategory } from './entities/item-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ItemCategoriesService {
  constructor(
    @InjectRepository(ItemCategory)
    private readonly itemCategoriesRepository: Repository<ItemCategory>,
  ) {}

  async create(name: string) {
    const itemCategory = this.itemCategoriesRepository.create({
      name: name,
      searchName: this.normalizeSearchText(name),
    });
    return await this.itemCategoriesRepository.save(itemCategory);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<ItemCategory>> {
    const [itemCategories, total] =
      await this.itemCategoriesRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          name: 'asc',
        },
      });

    return {
      data: itemCategories,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: number): Promise<ItemCategory> {
    const category = await this.itemCategoriesRepository.findOne({
      where: { id: id },
    });

    if (!category) {
      throw new NotFoundException('Item Category not found');
    }

    return category;
  }

  // TODO: extract to utils
  private normalizeSearchText(value: string): string {
    return value.trim().toLocaleLowerCase('uk-UA').normalize('NFC');
  }
}
