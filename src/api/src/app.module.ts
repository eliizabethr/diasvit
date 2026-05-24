import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ApplicationsModule } from './applications/applications.module';
import { Application } from './applications/entities/application.entity';
import { ItemsModule } from './items/items.module';
import { Item } from './items/entities/item.entity';
import { ApplicationItem } from './applications/entities/application-item.entity';
import { ItemCategoriesModule } from './item-categories/item-categories.module';
import { ItemCategory } from './item-categories/entities/item-category.entity';
import { VerificationModule } from './verification/verification.module';
import { VerificationTicket } from './verification/entities/verification-ticket.entity';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/config';
import { ReportsModule } from './reports/reports.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryOperation } from './inventory/entities/inventory-operation.entity';
import { ApplicationStatusModule } from './application-status/application-status.module';
import { ApplicationStatusTransition } from './application-status/entities/application-status-transition.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ItemsModule,
    ItemCategoriesModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      entities: [
        User,
        Application,
        Item,
        ApplicationItem,
        ItemCategory,
        InventoryOperation,
        ApplicationStatusTransition,
        VerificationTicket,
      ],
      synchronize: true, // good for local dev only
    }),
    VerificationModule,
    ReportsModule,
    InventoryModule,
    ApplicationStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
