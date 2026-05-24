import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationTicket } from './entities/verification-ticket.entity';
import { VerificationService } from './verification.service';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    TwilioModule.forRoot({
      accountSid: '***REMOVED***',
      authToken: '***REMOVED***',
    }),
    TypeOrmModule.forFeature([VerificationTicket]),
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
