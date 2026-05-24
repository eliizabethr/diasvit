import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationTicket } from './entities/verification-ticket.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { TwilioService } from 'nestjs-twilio';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerificationService {
  private readonly verifyServiceSid: string;

  constructor(
    configService: ConfigService,
    private readonly twilioService: TwilioService,
    @InjectRepository(VerificationTicket)
    private readonly verificationTicketsRepository: Repository<VerificationTicket>,
  ) {
    this.verifyServiceSid = configService.getOrThrow<string>('TWILIO_VERIFY_SERVICE_SID');
  }

  async requestCode(phone: string) {
    const verification = await this.twilioService.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: '+' + this.normalizePhone(phone),
        channel: 'sms',
      });

    return {
      verificationId: verification.sid,
    };
  }

  async verifyCode(phone: string, code: string) {
    const verificationCheck = await this.twilioService.client.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({
        to: '+' + this.normalizePhone(phone),
        code: code,
      });

    return {
      verificationId: verificationCheck.sid,
      isValid: verificationCheck.status === 'approved',
    };
  }

  async prepareTicket(
    phone: string,
    purpose: 'register' | 'sign_in',
    verificationId: string,
  ): Promise<VerificationTicket> {
    const ticket = this.verificationTicketsRepository.create({
      phone: this.normalizePhone(phone),
      purpose: purpose,
      channel: 'sms',
      provider: 'twilio',
      providerRequestId: verificationId,
    });

    return await this.verificationTicketsRepository.save(ticket);
  }

  async issueTicket(
    phone: string,
    purpose: 'register' | 'sign_in',
    verificationId: string,
    userIp: string,
    userAgent?: string,
  ): Promise<string> {
    const ticket = await this.verificationTicketsRepository.findOne({
      where: {
        phone: this.normalizePhone(phone),
        purpose: purpose,
        providerRequestId: verificationId,
        issuedAt: IsNull(),
        consumedAt: IsNull(),
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresIn = 5; // in minutes

    ticket.tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
    ticket.userIp = userIp;
    ticket.userAgent = userAgent ?? null;
    ticket.issuedAt = new Date();
    ticket.expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

    await this.verificationTicketsRepository.save(ticket);

    return token;
  }

  async verifyTicket(
    token: string,
    phone: string,
    purpose: 'register' | 'sign_in',
    userIp: string,
    userAgent?: string,
  ) {
    const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');

    const ticket = await this.verificationTicketsRepository.findOne({
      where: {
        tokenHash: tokenHash,
        phone: this.normalizePhone(phone),
        purpose: purpose,
        userIp: userIp,
        userAgent: userAgent,
        expiresAt: MoreThan(new Date()),
        consumedAt: IsNull(),
      },
    });

    if (!ticket) {
      return {
        isValid: false,
      };
    }

    ticket.consumedAt = new Date();

    await this.verificationTicketsRepository.save(ticket);

    return {
      isValid: true,
    };
  }

  // TODO: extract to shared utils
  private normalizePhone(phone: string): string {
    return phone.replace('+', '');
  }
}
