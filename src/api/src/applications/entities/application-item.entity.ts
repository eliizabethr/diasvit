import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Application } from './application.entity';
import { Item } from '../../items/entities/item.entity';

@Entity()
@Unique(['application', 'item'])
export class ApplicationItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Application, (application) => application.items, {
    onDelete: 'CASCADE',
  })
  application!: Application;

  @ManyToOne(() => Item, (item) => item.applicationItems, {
    onDelete: 'RESTRICT',
  })
  item!: Item;

  @Column({ type: 'integer' })
  quantity!: number;
}
