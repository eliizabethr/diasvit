import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ApplicationsService } from '../applications.service';
import { ApplicationUserResponseDto } from '../dto/user/application-user-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateApplicationUserRequestDto } from '../dto/user/create-application-user-request.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginatedApplicationsUserResponseDto } from '../dto/user/paginated-applications-user-response.dto';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard)
@Controller('me/applications')
export class ApplicationsUserController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({
    summary: 'Create a new aid application for the current user.',
  })
  @ApiCreatedResponse({ type: ApplicationUserResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Request() request,
    @Body() body: CreateApplicationUserRequestDto,
  ): Promise<ApplicationUserResponseDto> {
    const application = await this.applicationsService.create(
      request.user.sub,
      body.items,
      body.fulfillmentType,
      body.deliveryCity,
      body.deliveryAddress,
      body.pickupLocation,
      body.pickupDate,
      body.comment,
    );

    return {
      id: application.id,
      items: application.items.map((item) => ({
        id: item.item.id,
        name: item.item.name,
        quantity: item.quantity,
        unit: item.item.unit,
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
    };
  }

  @ApiOperation({ summary: 'Get all aid applications of the current user.' })
  @ApiOkResponse({ type: PaginatedApplicationsUserResponseDto })
  @Get()
  async findAll(
    @Request() request,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedApplicationsUserResponseDto> {
    const result = await this.applicationsService.findAllForUser(
      query.page,
      query.limit,
      request.user.sub,
    );

    return {
      data: result.data.map((application) => ({
        id: application.id,
        items: application.items.map((item) => ({
          id: item.item.id,
          name: item.item.name,
          quantity: item.quantity,
          unit: item.item.unit,
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
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  @ApiOperation({
    summary: 'Get an aid application of the current user by application ID.',
  })
  @Get(':id')
  async getById(
    @Request() request,
    @Param('id') applicationId: number,
  ): Promise<ApplicationUserResponseDto> {
    const application = await this.applicationsService.getById(
      applicationId,
      request.user.sub,
    );

    return {
      id: application.id,
      items: application.items.map((item) => ({
        id: item.item.id,
        name: item.item.name,
        quantity: item.quantity,
        unit: item.item.unit,
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
    };
  }
}
