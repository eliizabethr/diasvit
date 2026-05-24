import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    phone: string,
    firstName: string,
    middleName: string,
    lastName: string,
    dateOfBirth: string,
    roles?: UserRole[],
  ): Promise<User> {
    const user = this.usersRepository.create({
      phone: this.normalizePhone(phone),
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      roles: roles ?? [UserRole.USER],
    });

    // TODO: add catch of UNIQUE constraint fail
    return await this.usersRepository.save(user);
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<User>> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        lastName: 'asc',
      },
      relations: {
        applications: true,
      },
    });

    return {
      data: users,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getByPhone(phone: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { phone: this.normalizePhone(phone) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    return await this.usersRepository.exists({
      where: { phone: this.normalizePhone(phone) },
    });
  }

  // TODO: extract to shared utils
  private normalizePhone(phone: string): string {
    return phone.replace('+', '');
  }
}
