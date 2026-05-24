import { SetMetadata } from '@nestjs/common';

export enum VerificationPurpose {
  REGISTER = 'register',
  SIGN_IN = 'sign_in',
}

export const VERIFICATION_KEY = 'verification_purpose';

export const Verification = (purpose: VerificationPurpose) =>
  SetMetadata(VERIFICATION_KEY, purpose);
