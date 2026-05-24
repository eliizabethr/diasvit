import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationTicket } from './entities/verification-ticket.entity';
import { VerificationService } from './verification.service';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    TwilioModule.forRoot({
      accountSid: 'AC9870142d7a30701fbb4cfab16ac5f7fd',
      authToken: '5da80a513495dd86bb1bd25db314c259',
    }),
    TypeOrmModule.forFeature([VerificationTicket]),
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
