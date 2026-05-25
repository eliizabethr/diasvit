import { Application } from '../../applications/entities/application.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  phone!: string;

  @Column()
  firstName!: string;

  // TODO: make optional
  @Column()
  middleName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'date' })
  dateOfBirth!: string;

  @Column({
    type: 'varchar',
    length: 255,
    transformer: {
      to: (value: string[]) => value?.join('|'),
      from: (value: string) => value ? value.split('|') : [],
    }
  })
  roles!: UserRole[];

  @OneToMany(() => Application, (application) => application.user)
  applications!: Application[];
}
