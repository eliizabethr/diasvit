import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'MY_SECRET', // TODO: fix
      signOptions: {
        expiresIn: '24H',
      },
    }),
    VerificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
