import { Module } from '@nestjs/common';
import { ApplicationStatusService } from './application-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatusTransition } from './entities/application-status-transition.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationStatusTransition]),
    InventoryModule,
  ],
  providers: [ApplicationStatusService],
  exports: [ApplicationStatusService],
})
export class ApplicationStatusModule {}
