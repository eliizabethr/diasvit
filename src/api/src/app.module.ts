import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsModule } from './applications/applications.module';
import { ItemsModule } from './items/items.module';
import { ItemCategoriesModule } from './item-categories/item-categories.module';
import { VerificationModule } from './verification/verification.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/config';
import { ReportsModule } from './reports/reports.module';
import { InventoryModule } from './inventory/inventory.module';
import { ApplicationStatusModule } from './application-status/application-status.module';
import { getTypeOrmConfig } from './config/typeorm.config';

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
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    VerificationModule,
    ReportsModule,
    InventoryModule,
    ApplicationStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
