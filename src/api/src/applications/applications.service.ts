import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Application,
  ApplicationStatus,
  FulfillmentType,
} from './entities/application.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ApplicationItem } from './entities/application-item.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(ApplicationItem)
    private readonly applicationItemRepository: Repository<ApplicationItem>,
  ) { }

  async create(
    userId: number,
    items: { itemId: number; quantity: number }[],
    fulfillmentType: string,
    deliveryCity?: string,
    deliveryAddress?: string,
    pickupLocation?: string,
    pickupDate?: string,
    comment?: string,
  ): Promise<Application> {
    const user = await this.usersService.getById(userId);

    const application = this.applicationsRepository.create({
      items: [],
      fulfillmentType: fulfillmentType as FulfillmentType, // TODO: fix type
      deliveryCity,
      deliveryAddress,
      pickupLocation,
      pickupDate,
      comment,
      currentStatus: ApplicationStatus.NEW,
      user,
    });

    for (let i = 0; i < items.length; i++) {
      const item = await this.itemsService.getById(items[i].itemId);

      const applicationItem = this.applicationItemRepository.create({
        item,
        quantity: items[i].quantity,
      });

      application.items.push(applicationItem);
    }

    return await this.applicationsRepository.save(application);
  }

  async findAll(
    search?: string,
    categoryIds?: number[],
    statuses?: ApplicationStatus[],
    fulfillmentType?: FulfillmentType,
    orderBy: 'createdAt' | 'fullName' | 'phone' | 'status' = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Application>> {
    const offset = (page - 1) * limit;

    const baseQb = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoin('application.user', 'user')
      .leftJoin('application.items', 'applicationItem')
      .leftJoin('applicationItem.item', 'item')
      .leftJoin('item.category', 'category');

    if (search) {
      baseQb.andWhere(
        `(
        user.searchFullName LIKE :search
        OR user.phone LIKE :search
      )`,
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    if (categoryIds?.length) {
      baseQb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: categoryIds,
      });
    }

    if (statuses?.length) {
      baseQb.andWhere('application.currentStatus IN (:...statuses)', {
        statuses: statuses,
      });
    }

    if (fulfillmentType) {
      baseQb.andWhere('application.fulfillmentType = :fulfillmentType', {
        fulfillmentType: fulfillmentType,
      });
    }

    const order = orderDirection.toUpperCase() as 'ASC' | 'DESC';

    const idsQb = baseQb
      .clone()
      .select('application.id', 'id')
      .groupBy('application.id');

    switch (orderBy) {
      case 'fullName':
        idsQb
          .addSelect('user.searchFullName', 'searchFullName')
          .addGroupBy('user.searchFullName')
          .orderBy('user.searchFullName', order)
          .addOrderBy('application.id', 'DESC');
        break;

      case 'phone':
        idsQb
          .addSelect('user.phone', 'phone')
          .addGroupBy('user.phone')
          .orderBy('user.phone', order)
          .addOrderBy('application.id', 'DESC');
        break;

      case 'status':
        idsQb
          .addSelect('application.currentStatus', 'status')
          .addGroupBy('application.currentStatus')
          .orderBy('application.currentStatus', order)
          .addOrderBy('application.id', 'DESC');
        break;

      case 'createdAt':
        idsQb
          .addSelect('application.createdAt', 'createdAt')
          .addGroupBy('application.createdAt')
          .orderBy('application.createdAt', order)
          .addOrderBy('application.id', 'DESC');
        break;
    }

    idsQb.offset(offset).limit(limit);

    const countQb = baseQb
      .clone()
      .select('COUNT(DISTINCT application.id)', 'total');

    const [idRows, countRow] = await Promise.all([
      idsQb.getRawMany<{ id: number | string }>(),
      countQb.getRawOne<{ total: number | string }>(),
    ]);

    // preserving the order
    const applicationIds = idRows.map((row) => Number(row.id));
    const total = Number(countRow?.total ?? 0);

    if (applicationIds.length === 0) {
      return {
        data: [],
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }

    const applications = await this.applicationsRepository.find({
      where: {
        id: In(applicationIds),
      },
      relations: {
        items: {
          item: {
            category: true,
          },
        },
        user: true,
      },
    });

    const applicationsById = new Map(
      applications.map((application) => [application.id, application]),
    );

    const orderedApplications = applicationIds
      .map((id) => applicationsById.get(id))
      .filter((application): application is Application =>
        Boolean(application),
      );

    return {
      data: orderedApplications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForUser(
    page: number = 1,
    limit: number = 10,
    userId?: number,
  ): Promise<PaginatedResult<Application>> {
    const [applications, total] =
      await this.applicationsRepository.findAndCount({
        where: {
          user: { id: userId },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'desc',
        },
        relations: {
          items: {
            item: true,
          },
        },
      });

    return {
      data: applications,
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(applicationId: number, userId?: number): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: {
        id: applicationId,
        user: { id: userId },
      },
      relations: {
        items: {
          application: true,
          item: true,
        },
        user: {
          applications: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateById(applicationId: number, status?: ApplicationStatus) {
    // const application = await this.applicationsRepository.findOne({
    //   where: { id: applicationId },
    //   relations: {
    //     items: {
    //       application: true,
    //       item: true,
    //     },
    //     user: {
    //       applications: true,
    //     },
    //   },
    // });
    // if (!application) {
    //   throw new NotFoundException('Application not found');
    // }
    // if (status) {
    //   await this.applicationStatusService.changeStatus(1, applicationId, status);
    // }
    // return await this.applicationsRepository.save(application);
  }
}
