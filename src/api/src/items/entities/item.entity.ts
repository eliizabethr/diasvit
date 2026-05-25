import { ItemCategory } from '../../item-categories/entities/item-category.entity';
import { ApplicationItem } from '../../applications/entities/application-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryOperation } from '../../inventory/entities/inventory-operation.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Index()
  @Column()
  searchName!: string; // for case-insensitive search, always lower-case

  @Column()
  categoryId!: number;

  @ManyToOne(() => ItemCategory, (category) => category.items, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: ItemCategory;

  @Column({ type: 'varchar', length: 255 })
  unit!: string;

  @Column({ type: 'integer', default: 0 })
  currentStock!: number;

  @OneToMany(() => InventoryOperation, (operation) => operation.item)
  inventoryOperations!: InventoryOperation[];

  @OneToMany(() => ApplicationItem, (applicationItem) => applicationItem.item)
  applicationItems!: ApplicationItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
