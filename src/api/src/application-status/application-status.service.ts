import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  ApplicationStatusTransition,
} from './entities/application-status-transition.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Application } from 'src/applications/entities/application.entity';
import {
  InventoryOperation,
  InventoryOperationType,
} from 'src/inventory/entities/inventory-operation.entity';
import { InventoryService } from 'src/inventory/inventory.service';

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.NEW]: [
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.IN_REVIEW]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.APPROVED]: [
    ApplicationStatus.PREPARING,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.PREPARING]: [
    ApplicationStatus.READY_FOR_DELIVERY,
    ApplicationStatus.READY_FOR_PICKUP,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.READY_FOR_DELIVERY]: [
    ApplicationStatus.SHIPPED,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.SHIPPED]: [
    ApplicationStatus.COMPLETED,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.READY_FOR_PICKUP]: [
    ApplicationStatus.COMPLETED,
    ApplicationStatus.CANCELLED,
  ],

  [ApplicationStatus.REJECTED]: [],

  [ApplicationStatus.COMPLETED]: [],

  [ApplicationStatus.CANCELLED]: [],
};

@Injectable()
export class ApplicationStatusService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async changeStatus(
    changedByUserId: number,
    applicationId: number,
    newStatus: ApplicationStatus,
    comment?: string,
  ): Promise<Application> {
    return await this.dataSource.transaction(async (manager) => {
      const application = await manager.findOne(Application, {
        where: { id: applicationId },
        relations: {
          items: {
            item: true,
          },
        },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      const oldStatus = application.currentStatus;

      if (oldStatus === newStatus) {
        throw new BadRequestException(
          `The new application status should be different from the current status.`,
        );
      }

      this.validateApplicationStatusTransition(oldStatus, newStatus);

      const updateResult = await manager
        .createQueryBuilder()
        .update(Application)
        .set({
          currentStatus: newStatus,
        })
        .where('id = :applicationId', {
          applicationId: applicationId,
        })
        .andWhere('currentStatus = :oldStatus', {
          oldStatus,
        })
        .execute();

      if (updateResult.affected !== 1) {
        throw new ConflictException(
          'Application status has been changed by another operation. Please retry.',
        );
      }

      if (newStatus === ApplicationStatus.APPROVED) {
        await this.issueApplicationItemsInTransaction(manager, {
          application,
          performedByUserId: changedByUserId,
        });
      }

      const statusTransition = manager.create(ApplicationStatusTransition, {
        applicationId: applicationId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        changedByUserId: changedByUserId,
        comment: comment,
      });

      await manager.save(ApplicationStatusTransition, statusTransition);

      const updatedApplication = await manager.findOne(Application, {
        where: { id: applicationId },
        relations: {
          items: {
            item: true,
          },
          statusHistory: true,
          user: {
            applications: true,
          },
        },
      });

      return updatedApplication!;
    });
  }

  // TODO: extract to utils
  private validateApplicationStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ): void {
    const allowedNextStatuses = allowedTransitions[currentStatus];

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change application status from '${currentStatus}' to '${newStatus}'.`,
      );
    }
  }

  private async issueApplicationItemsInTransaction(
    manager: EntityManager,
    input: {
      application: Application;
      performedByUserId: number;
    },
  ) {
    for (const applicationItem of input.application.items) {
      const isAlreadyIssued = await manager.exists(InventoryOperation, {
        where: {
          applicationItemId: applicationItem.id,
          type: InventoryOperationType.USAGE,
        },
      });

      if (isAlreadyIssued) {
        continue;
      }

      // TODO: maybe use 'issue' instead of 'usage'
      await this.inventoryService.createOperationForItemInTransaction(manager, {
        performedByUserId: input.performedByUserId,
        itemId: applicationItem.item.id,
        operationType: InventoryOperationType.USAGE,
        quantity: applicationItem.quantity,
        applicationId: input.application.id,
        applicationItemId: applicationItem.id,
        comment: `Видано для заявки # ${input.application.id}`,
      });
    }
  }
}
