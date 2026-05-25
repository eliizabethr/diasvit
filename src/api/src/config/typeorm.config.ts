import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ApplicationStatusTransition } from '../application-status/entities/application-status-transition.entity';
import { ApplicationItem } from '../applications/entities/application-item.entity';
import { Application } from '../applications/entities/application.entity';
import { InventoryOperation } from '../inventory/entities/inventory-operation.entity';
import { ItemCategory } from '../item-categories/entities/item-category.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { VerificationTicket } from '../verification/entities/verification-ticket.entity';

const entities = [
  User,
  Application,
  Item,
  ApplicationItem,
  ItemCategory,
  InventoryOperation,
  ApplicationStatusTransition,
  VerificationTicket,
];

export function getTypeOrmConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const isStaging = process.env.NODE_ENV === 'staging';

  if (isProduction || isStaging) {
    return {
      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      entities: entities,

      autoLoadEntities: true,
      // synchronize: false,
      synchronize: true, // TODO: use migrations
      logging: process.env.DB_LOGGING === 'true',

      options: {
        encrypt: true,
        trustServerCertificate: false,
      },

      connectionTimeout: 60000,
      extra: {
        connectionTimeout: 60000,
        requestTimeout: 60000,
      },
    };
  }

  // development or local
  return {
    type: 'better-sqlite3',
    database: process.env.DB_DATABASE ?? 'db.sqlite',

    entities: entities,

    autoLoadEntities: true,
    synchronize: true,
    logging: process.env.DB_LOGGING === 'true',
  };
}
