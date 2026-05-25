import { User } from '../../users/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

@Entity()
export class ApplicationStatusTransition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  applicationId!: number;

  @ManyToOne(() => Application, (application) => application.statusHistory, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'applicationId' })
  application!: Application;

  @Column({ type: 'varchar', length: 255, })
  fromStatus!: ApplicationStatus;

  @Column({ type: 'varchar', length: 255, })
  toStatus!: ApplicationStatus;

  @Column()
  changedByUserId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'changedByUserId' })
  changedByUser!: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
