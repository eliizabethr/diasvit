import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { Application } from '../../applications/entities/application.entity';
import { User } from '../../users/entities/user.entity';
import { ApplicationItem } from '../../applications/entities/application-item.entity';

export enum InventoryOperationType {
  INCOME = 'income',
  USAGE = 'usage',
  CORRECTION_INCREASE = 'correction_increase',
  CORRECTION_DECREASE = 'correction_decrease',
}

@Entity()
@Index(['itemId', 'id'])
@Index(['applicationItemId', 'type'], {
  unique: true,
  where: '"applicationItemId" IS NOT NULL'
})
export class InventoryOperation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  itemId!: number;

  @ManyToOne(() => Item, (item) => item.inventoryOperations, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @Column({ type: 'varchar', length: 255, })
  type!: InventoryOperationType;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'integer' })
  stockBefore!: number;

  @Column({ type: 'integer' })
  stockAfter!: number;

  @Column({ nullable: true })
  applicationId!: number | null;

  @ManyToOne(() => Application, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'applicationId' })
  application!: Application | null;

  @Column({ nullable: true })
  applicationItemId!: number | null;

  @ManyToOne(() => ApplicationItem, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'applicationItemId' })
  applicationItem!: ApplicationItem | null;

  @Column()
  performedByUserId!: number;

  @ManyToOne(() => User, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'performedByUserId' })
  performedByUser!: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
