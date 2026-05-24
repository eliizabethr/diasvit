import { Item } from '../../items/entities/item.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Index()
  @Column()
  searchName!: string; // for case-insensitive search, always lower-case

  @OneToMany(() => Item, (item) => item.category)
  items!: Item[];
}
