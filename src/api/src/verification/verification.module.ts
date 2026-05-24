import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationTicket } from './entities/verification-ticket.entity';
import { VerificationService } from './verification.service';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
        authToken: configService.getOrThrow<string>('TWILIO_AUTH_TOKEN')
      }),
    }),
    TypeOrmModule.forFeature([VerificationTicket]),
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule { }
