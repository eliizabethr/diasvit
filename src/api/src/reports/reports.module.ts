import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryOperation } from '../inventory/entities/inventory-operation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryOperation])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
