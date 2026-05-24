import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { CurrentUserService } from '../auth/current-user.service';
import { TokenStorageService } from '../auth/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  const accessToken = tokenStorage.getAccessToken();

  const authReq = accessToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isAuthRequest = req.url.includes('/auth/');

        if (!isAuthRequest) {
          tokenStorage.removeAccessToken();
          currentUserService.clearCurrentUser();
          router.navigateByUrl('/auth/sign-in');
        }
      }

      return throwError(() => error);
    }),
  );
};