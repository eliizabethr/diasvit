import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryOperation } from './entities/inventory-operation.entity';
import { Item } from '../items/entities/item.entity';
import { ItemCategory } from '../item-categories/entities/item-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryOperation, Item, ItemCategory])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
