import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class VerificationTicket {
  @PrimaryGeneratedColumn()
  id!: number;

  // TODO: use static length
  @Column({ type: 'varchar', nullable: true })
  tokenHash!: string | null;

  @Column()
  phone!: string;

  @Column()
  purpose!: 'register' | 'sign_in';

  @Column({ type: 'varchar', nullable: true })
  userIp!: string | null;

  @Column({ type: 'varchar', nullable: true })
  userAgent!: string | null;

  @Column()
  channel!: 'sms';

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  issuedAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  consumedAt!: Date | null;

  @Column()
  provider!: 'twilio';

  @Column()
  providerRequestId!: string;
}
