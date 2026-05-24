import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsUserController } from './controllers/items-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemCategoriesModule } from '../item-categories/item-categories.module';

@Module({
  imports: [ItemCategoriesModule, TypeOrmModule.forFeature([Item])],
  providers: [ItemsService],
  controllers: [ItemsUserController],
  exports: [ItemsService],
})
export class ItemsModule {}
