import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsUserController } from './controllers/applications-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { ApplicationItem } from './entities/application-item.entity';
import { ApplicationsAdminController } from './controllers/applications-admin.controller';
import { ApplicationStatusModule } from '../application-status/application-status.module';

@Module({
  imports: [
    UsersModule,
    ItemsModule,
    ApplicationStatusModule,
    TypeOrmModule.forFeature([Application, ApplicationItem]),
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsUserController, ApplicationsAdminController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
