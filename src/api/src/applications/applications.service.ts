import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Application,
  ApplicationStatus,
  FulfillmentType,
} from './entities/application.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ApplicationItem } from './entities/application-item.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { ApplicationStatusService } from 'src/application-status/application-status.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly applicationStatusService: ApplicationStatusService,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(ApplicationItem)
    private readonly applicationItemRepository: Repository<ApplicationItem>,
  ) {}

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
          id: 'desc',
        },
        relations: {
          items: {
            application: true,
            item: {
              category: true,
            }
          },
          user: {
            applications: true,
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
