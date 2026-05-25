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
      searchFullName: this.normalizeSearchText(
        `${lastName} ${firstName} ${middleName}`,
      ),
      dateOfBirth: dateOfBirth,
      roles: roles ?? [UserRole.USER],
    });

    // TODO: add catch of UNIQUE constraint fail
    return await this.usersRepository.save(user);
  }

  async findAll(
    search?: string,
    orderBy: 'fullName' | 'phone' | 'age' | 'applicationsCount' = 'fullName',
    orderDirection: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10,
  ): Promise<
    PaginatedResult<
      Omit<User, 'searchFullName' | 'applications'> & {
        applicationsCount: number;
      }
    >
  > {
    const offset = (page - 1) * limit;

    const usersQb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.applications', 'application')
      .select('user.id', 'id')
      .addSelect('user.phone', 'phone')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.middleName', 'middleName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.searchFullName', 'searchFullName')
      .addSelect('user.dateOfBirth', 'dateOfBirth')
      .addSelect('user.roles', 'roles')
      .addSelect('COUNT(application.id)', 'applicationsCount')
      .groupBy('user.id')
      .addGroupBy('user.phone')
      .addGroupBy('user.firstName')
      .addGroupBy('user.middleName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.searchFullName')
      .addGroupBy('user.dateOfBirth')
      .addGroupBy('user.roles');

    if (search) {
      usersQb.andWhere(
        `(
        user.searchFullName LIKE :search
        OR user.phone LIKE :search
      )`,
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    const order = orderDirection.toUpperCase() as 'ASC' | 'DESC';

    switch (orderBy) {
      case 'phone':
        usersQb.orderBy('user.phone', order);
        break;

      case 'age':
        usersQb.orderBy('user.dateOfBirth', order === 'ASC' ? 'DESC' : 'ASC');
        break;

      case 'applicationsCount':
        usersQb.orderBy('applicationsCount', order);
        break;

      case 'fullName':
        usersQb.orderBy('user.searchFullName', order);
        break;
    }

    usersQb.offset(offset).limit(limit);

    const countQb = this.usersRepository.createQueryBuilder('user');

    if (search) {
      usersQb.andWhere(
        `(
        user.searchFullName LIKE :search
        OR user.phone LIKE :search
      )`,
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    const [rows, total] = await Promise.all([
      usersQb.getRawMany(),
      countQb.getCount(),
    ]);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        phone: row.phone,
        firstName: row.firstName,
        middleName: row.middleName ?? null,
        lastName: row.lastName,
        dateOfBirth: row.dateOfBirth,
        roles: row.roles.split('|'),
        applicationsCount: Number(row.applicationsCount),
      })),
      page,
      limit,
      total,
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
    return phone.replace('+', '').replace(' ', '');
  }

  // TODO: extract to utils
  private normalizeSearchText(value: string): string {
    return value.trim().toLocaleLowerCase('uk-UA').normalize('NFC');
  }
}
