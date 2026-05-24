export type VerificationPurpose = 'register' | 'sign_in';

export interface RequestCodeRequest {
  phone: string;
  purpose: VerificationPurpose;
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
  purpose: VerificationPurpose;
}

export interface VerifyCodeResponse {
  token: string;
}

export interface SignInRequest {
  phone: string;
}

export interface SignInResponse {
  access_token: string;
}

export interface RegisterUserRequest {
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
}