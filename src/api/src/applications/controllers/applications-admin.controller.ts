import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
  Request,
  NotImplementedException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ApplicationsService } from '../applications.service';
import { UpdateApplicationAdminRequestDto } from '../dto/admin/update-application-admin-request.dto';
import { AdminGuard } from '../../auth/admin.guard';
import { ApplicationAdminResponseDto } from '../dto/admin/application-admin-response.dto';
import { ApplicationsQueryAdminRequestDto } from '../dto/admin/applications-query-admin-request.dto';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PaginatedApplicationsAdminResponseDto } from '../dto/admin/paginated-applications-admin-response.dto';
import { ChangeApplicationStatusRequestDto } from '../dto/admin/change-application-status-request.dto';
import { ApplicationStatusService } from 'src/application-status/application-status.service';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/applications')
export class ApplicationsAdminController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly applicationStatusService: ApplicationStatusService,
  ) { }

  @ApiOperation({ summary: 'Get all aid applications in the system.' })
  @ApiOkResponse({ type: PaginatedApplicationsAdminResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: ApplicationsQueryAdminRequestDto,
  ): Promise<PaginatedApplicationsAdminResponseDto> {
    const result = await this.applicationsService.findAll(
      query.page !== undefined ? Number(query.page) : undefined,
      query.limit !== undefined ? Number(query.limit) : undefined,
    );

    return {
      data: result.data.map((application) => ({
        id: application.id,
        items: application.items.map((item) => ({
          id: item.id,
          item: {
            id: item.item.id,
            name: item.item.name,
            currentStock: item.item.currentStock,
            category: item.item.category,
            unit: item.item.unit,
            createdAt: item.item.createdAt,
            updatedAt: item.item.updatedAt,
          },
          quantity: item.quantity,
        })),
        fulfillmentType: application.fulfillmentType,
        deliveryCity: application.deliveryCity,
        deliveryAddress: application.deliveryAddress,
        pickupLocation: application.pickupLocation,
        pickupDate: application.pickupDate,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        comment: application.comment,
        status: application.currentStatus,
        user: {
          id: application.user.id,
          phone: application.user.phone,
          firstName: application.user.firstName,
          middleName: application.user.middleName,
          lastName: application.user.lastName,
          dateOfBirth: application.user.dateOfBirth,
          applicationsCount: application.user.applications.length,
          roles: application.user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
        },
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  @ApiOperation({ summary: 'Get an aid application by application ID.' })
  @ApiOkResponse({ type: ApplicationAdminResponseDto })
  // @ApiNotFoundResponse()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(
    @Param('id') applicationId: number,
  ): Promise<ApplicationAdminResponseDto> {
    const application = await this.applicationsService.getById(applicationId);

    return {
      id: application.id,
      items: application.items.map((item) => ({
        id: item.id,
        item: {
          id: item.item.id,
          name: item.item.name,
          currentStock: item.item.currentStock,
          category: item.item.category,
          unit: item.item.unit,
          createdAt: item.item.createdAt,
          updatedAt: item.item.updatedAt,
        },
        quantity: item.quantity,
      })),
      fulfillmentType: application.fulfillmentType,
      deliveryCity: application.deliveryCity,
      deliveryAddress: application.deliveryAddress,
      pickupLocation: application.pickupLocation,
      pickupDate: application.pickupDate,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      comment: application.comment,
      status: application.currentStatus,
      user: {
        id: application.user.id,
        phone: application.user.phone,
        firstName: application.user.firstName,
        middleName: application.user.middleName,
        lastName: application.user.lastName,
        dateOfBirth: application.user.dateOfBirth,
        applicationsCount: application.user.applications.length,
        roles: application.user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
      },
    };
  }

  @ApiOperation({ summary: 'Update the status of an aid application by application ID.' })
  @ApiOkResponse({ type: ApplicationAdminResponseDto })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  async changeStatus(
    @Request() request,
    @Param('id') applicationId: number,
    @Body() body: ChangeApplicationStatusRequestDto,
    // @CurrentUser() user: User, // TODO: create
  ): Promise<ApplicationAdminResponseDto> {
    const application = await this.applicationStatusService.changeStatus(
      request.user.sub,
      applicationId,
      body.status,
      body.comment,
    );

    return {
      id: application.id,
      items: application.items.map((item) => ({
        id: item.id,
        item: {
          id: item.item.id,
          name: item.item.name,
          currentStock: item.item.currentStock,
          category: item.item.category,
          unit: item.item.unit,
          createdAt: item.item.createdAt,
          updatedAt: item.item.updatedAt,
        },
        quantity: item.quantity,
      })),
      fulfillmentType: application.fulfillmentType,
      deliveryCity: application.deliveryCity,
      deliveryAddress: application.deliveryAddress,
      pickupLocation: application.pickupLocation,
      pickupDate: application.pickupDate,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      comment: application.comment,
      status: application.currentStatus,
      user: {
        id: application.user.id,
        phone: application.user.phone,
        firstName: application.user.firstName,
        middleName: application.user.middleName,
        lastName: application.user.lastName,
        dateOfBirth: application.user.dateOfBirth,
        applicationsCount: application.user.applications.length,
        roles: application.user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
      },
    };
  }

  @ApiOperation({ summary: 'Update an aid application by application ID.' })
  @ApiOkResponse({ type: ApplicationAdminResponseDto })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateById(
    @Param('id') applicationId: number,
    @Body() body: UpdateApplicationAdminRequestDto,
  ): Promise<ApplicationAdminResponseDto> {
    throw new NotImplementedException();
    // const application = await this.applicationsService.updateById(
    //   applicationId,
    //   body.status as ApplicationStatus | undefined,
    // );

    // return {
    //   id: application.id,
    //   items: application.items.map((item) => ({
    //     id: item.id,
    //     item: {
    //       id: item.item.id,
    //       name: item.item.name,
    //       currentStock: item.item.currentStock,
    //       category: item.item.category,
    //       unit: item.item.unit,
    //       createdAt: item.item.createdAt,
    //       updatedAt: item.item.updatedAt,
    //     },
    //     quantity: item.quantity,
    //   })),
    //   fulfillmentType: application.fulfillmentType,
    //   deliveryCity: application.deliveryCity,
    //   deliveryAddress: application.deliveryAddress,
    //   pickupLocation: application.pickupLocation,
    //   pickupDate: application.pickupDate,
    //   createdAt: application.createdAt,
    //   updatedAt: application.updatedAt,
    //   comment: application.comment,
    //   status: application.currentStatus,
    //   user: {
    //     id: application.user.id,
    //     phone: application.user.phone,
    //     firstName: application.user.firstName,
    //     middleName: application.user.middleName,
    //     lastName: application.user.lastName,
    //     dateOfBirth: application.user.dateOfBirth,
    //     applicationsCount: application.user.applications.length,
    //     roles: application.user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
    //   },
    // };
  }
}
