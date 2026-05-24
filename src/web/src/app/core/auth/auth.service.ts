import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  RegisterUserRequest,
  RequestCodeRequest,
  SignInRequest,
  SignInResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiUrl = environment.apiUrl;

  requestCode(payload: RequestCodeRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/request-code`, payload);
  }

  verifyCode(payload: VerifyCodeRequest): Observable<VerifyCodeResponse> {
    return this.http.post<VerifyCodeResponse>(`${this.apiUrl}/auth/verify-code`, payload);
  }

  signIn(payload: SignInRequest, verificationToken: string): Observable<SignInResponse> {
    const headers = new HttpHeaders({
      'X-Verification-Token': verificationToken,
    });

    return this.http
      .post<SignInResponse>(`${this.apiUrl}/auth/sign-in`, payload, { headers })
      .pipe(
        tap((response) => {
          this.tokenStorage.setAccessToken(response.access_token);
        }),
      );
  }

  register(payload: RegisterUserRequest, verificationToken: string): Observable<SignInResponse> {
    const headers = new HttpHeaders({
      'X-Verification-Token': verificationToken,
    });

    return this.http
      .post<SignInResponse>(`${this.apiUrl}/auth/register`, payload, { headers })
      .pipe(
        tap((response) => {
          this.tokenStorage.setAccessToken(response.access_token);
        }),
      );
  }

  logout(): void {
    this.tokenStorage.removeAccessToken();
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.hasAccessToken();
  }
}