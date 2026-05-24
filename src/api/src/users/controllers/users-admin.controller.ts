import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserAdminResponseDto } from '../dto/admin/user-admin-response.dto';
import { CreateUserAdminRequestDto } from '../dto/admin/create-user-admin-request.dto';
import { UserRole } from '../entities/user.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { UsersQueryAdminRequestDto } from '../dto/admin/users-query-admin-request.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PaginatedUsersAdminResponseDto } from '../dto/admin/paginated-users-admin-response.dto';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: UserAdminResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() body: CreateUserAdminRequestDto,
  ): Promise<UserAdminResponseDto> {
    const user = await this.usersService.create(
      body.phone,
      body.firstName,
      body.middleName,
      body.lastName,
      body.dateOfBirth,
      body.roles as unknown as UserRole[], // TODO: check proper fix
    );

    return {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      applicationsCount: 0,
      roles: user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
    };
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ type: PaginatedUsersAdminResponseDto })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: UsersQueryAdminRequestDto,
  ): Promise<PaginatedUsersAdminResponseDto> {
    const result = await this.usersService.findAll(
      query.search,
      query.page !== undefined ? Number(query.page) : undefined,
      query.limit !== undefined ? Number(query.limit) : undefined,
    );

    return {
      data: result.data.map((user) => ({
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        applicationsCount: user.applications.length, // TODO: optimize
        roles: user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}
