import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Headers,
  Ip,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerificationGuard } from '../verification/verification.guard';
import {
  Verification,
  VerificationPurpose,
} from '../verification/verification.decorator';
import { RegisterUserRequestDto } from './dto/register-user-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { RequestCodeRequestDto } from './dto/request-code-request.dto';
import { VerifyCodeRequestDto } from './dto/verify-code-request.dto';
import { VerifyCodeResponseDto } from './dto/verify-code-response.dto';
import {
  ApiAcceptedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign into the system using a one-time token.' })
  @ApiHeader({
    name: 'X-Verification-Token',
    description:
      'A one-time token received from POST /verify-code with purpose=sign_in.',
    required: true,
  })
  @UseGuards(VerificationGuard)
  @Verification(VerificationPurpose.SIGN_IN)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    const token = await this.authService.signIn(signInDto.phone);

    return {
      access_token: token,
    };
  }

  @ApiOperation({
    summary:
      'Register in the system using a one-time token and sign in immediately.',
  })
  @ApiHeader({
    name: 'X-Verification-Token',
    description:
      'A one-time token received from POST /verify-code with purpose=register.',
    required: true,
  })
  @UseGuards(VerificationGuard)
  @Verification(VerificationPurpose.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() body: RegisterUserRequestDto,
  ): Promise<SignInResponseDto> {
    const token = await this.authService.register(
      body.phone,
      body.firstName,
      body.middleName,
      body.lastName,
      body.dateOfBirth,
    );

    return {
      access_token: token,
    };
  }

  @ApiOperation({ summary: 'Request an SMS verification code.' })
  @ApiAcceptedResponse()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('request-code')
  async requestCode(@Body() body: RequestCodeRequestDto): Promise<void> {
    await this.authService.requestCode(body.phone, body.purpose);
  }

  @ApiOperation({ summary: 'Verify a requsted SMS verification code.' })
  @ApiOkResponse({ type: VerifyCodeResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('verify-code')
  async verifyCode(
    @Ip() userIp: string,
    @Headers('user-agent') userAgent: string,
    @Body()
    body: VerifyCodeRequestDto,
  ): Promise<VerifyCodeResponseDto> {
    const token = await this.authService.verifyCode(
      body.phone,
      body.code,
      body.purpose,
      userIp,
      userAgent,
    );

    return {
      token: token,
    };
  }
}
