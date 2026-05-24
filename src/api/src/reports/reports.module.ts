import { Module } from '@nestjs/common';
import { ReportsAdminController } from './reports-admin.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsAdminController],
  providers: [ReportsService],
})
export class ReportsModule {}
