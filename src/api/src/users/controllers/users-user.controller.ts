import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserUserResponseDto } from '../dto/user/user-user-response.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('me')
export class UsersUserController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({ type: UserUserResponseDto })
  @ApiBearerAuth('JwtAuth')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async get(@Request() request): Promise<UserUserResponseDto> {
    const user = await this.usersService.getById(request.user.sub);

    return {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      roles: user.roles as unknown as ('user' | 'admin')[], // TODO: check proper fix
    };
  }
}
