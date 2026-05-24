import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersUserController } from './controllers/users-user.controller';
import { UsersAdminController } from './controllers/users-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersUserController, UsersAdminController],
})
export class UsersModule {}
