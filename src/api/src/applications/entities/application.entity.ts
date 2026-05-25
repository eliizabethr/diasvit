import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationItem } from './application-item.entity';
import { ApplicationStatusTransition } from '../../application-status/entities/application-status-transition.entity';

export enum ApplicationStatus {
  NEW = 'new',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PREPARING = 'preparing',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  READY_FOR_PICKUP = 'ready_for_pickup',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FulfillmentType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(
    () => ApplicationItem,
    (applicationItem) => applicationItem.application,
    { cascade: true },
  )
  items!: ApplicationItem[];

  @Column({ type: 'varchar', length: 255 })
  fulfillmentType!: FulfillmentType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryCity!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryAddress!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pickupLocation!: string | null;

  @Column({ type: 'datetime', nullable: true })
  pickupDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    default: ApplicationStatus.NEW,
  })
  currentStatus!: ApplicationStatus;

  @OneToMany(
    () => ApplicationStatusTransition,
    (history) => history.application,
  )
  statusHistory!: ApplicationStatusTransition[];

  @ManyToOne(() => User, (user) => user.applications, {
    onDelete: 'CASCADE',
  })
  user!: User;
}
