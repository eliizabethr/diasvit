import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { Reflector } from '@nestjs/core';
import {
  VERIFICATION_KEY,
  VerificationPurpose,
} from './verification.decorator';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../config/config';

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verificationService: VerificationService,
    private readonly configService: ConfigService<Configuration, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.configService.get<boolean>('smsVerificationEnabled')) {
      return true;
    }

    const purpose = this.reflector.getAllAndOverride<VerificationPurpose>(
      VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!purpose) {
      throw new Error('Ticket purpose is not configured for this route');
    }

    const request = context.switchToHttp().getRequest();
    const userIp = request.ip;
    const userAgent = request.headers['user-agent'];
    const phone = request.body?.phone;
    const token = request.headers['x-verification-token'];

    if (!phone || !token) {
      throw new ForbiddenException('SMS verification required');
    }

    const { isValid } = await this.verificationService.verifyTicket(
      token,
      phone,
      purpose,
      userIp,
      userAgent,
    );

    if (!isValid) {
      throw new ForbiddenException('SMS verification required');
    }

    return true;
  }
}
