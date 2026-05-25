import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

import { User } from './users/entities/user.entity';
import { Application } from './applications/entities/application.entity';
import { Item } from './items/entities/item.entity';
import { ApplicationItem } from './applications/entities/application-item.entity';
import { ItemCategory } from './item-categories/entities/item-category.entity';
import { InventoryOperation } from './inventory/entities/inventory-operation.entity';
import { ApplicationStatusTransition } from './application-status/entities/application-status-transition.entity';
import { VerificationTicket } from './verification/entities/verification-ticket.entity';

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

const isAzureDatabase =
  process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = isAzureDatabase
  ? {
    type: 'mssql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 1433),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities,
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  }
  : {
    type: 'better-sqlite3',
    database: process.env.DB_DATABASE ?? 'db.sqlite',
    entities,
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  };

export default new DataSource(dataSourceOptions);