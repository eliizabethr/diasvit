import { Module } from '@nestjs/common';
import { ItemCategoriesAdminController } from './controllers/item-categories-admin.controller';
import { ItemCategoriesService } from './item-categories.service';
import { ItemCategory } from './entities/item-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoriesUserController } from './controllers/item-categories-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCategory])],
  controllers: [ItemCategoriesUserController, ItemCategoriesAdminController],
  providers: [ItemCategoriesService],
  exports: [ItemCategoriesService],
})
export class ItemCategoriesModule {}
