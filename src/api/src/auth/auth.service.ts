import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
  ) {}

  async signIn(phone: string): Promise<string> {
    try {
      const user = await this.usersService.getByPhone(phone);

      const payload = {
        sub: user.id,
        roles: user.roles,
      };

      return await this.jwtService.signAsync(payload);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async register(
    phone: string,
    firstName: string,
    middleName: string,
    lastName: string,
    dateOfBirth: string,
  ): Promise<string> {
    const user = await this.usersService.create(
      phone,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
    );

    const payload = {
      sub: user.id,
      roles: user.roles,
    };

    return await this.jwtService.signAsync(payload);
  }

  async requestCode(
    phone: string,
    purpose: 'register' | 'sign_in',
  ): Promise<void> {
    console.log();

    if (
      purpose === 'sign_in' &&
      !(await this.usersService.existsByPhone(phone))
    ) {
      // silently return success to prevent user enumeration, no SMS code requested
      return;
    }

    const { verificationId } =
      await this.verificationService.requestCode(phone);

    await this.verificationService.prepareTicket(
      phone,
      purpose,
      verificationId,
    );
  }

  async verifyCode(
    phone: string,
    code: string,
    purpose: 'register' | 'sign_in',
    userIp: string,
    userAgent?: string,
  ): Promise<string> {
    const { verificationId, isValid } =
      await this.verificationService.verifyCode(phone, code);

    if (!isValid) {
      throw new BadRequestException('Invalid code');
    }

    const token = await this.verificationService.issueTicket(
      phone,
      purpose,
      verificationId,
      userIp,
      userAgent,
    );

    return token;
  }
}
