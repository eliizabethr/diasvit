import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { CurrentUserService } from '../auth/current-user.service';
import { TokenStorageService } from '../auth/token-storage.service';

export const adminGuard: CanActivateFn = () => {
  const currentUserService = inject(CurrentUserService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.hasAccessToken()) {
    return router.createUrlTree(['/auth/sign-in']);
  }

  const currentUser = currentUserService.currentUser();

  if (currentUser) {
    return currentUser.roles.includes('admin')
      ? true
      : router.createUrlTree(['/profile']);
  }

  return currentUserService.loadCurrentUser().pipe(
    map((user) => {
      return user.roles.includes('admin')
        ? true
        : router.createUrlTree(['/profile']);
    }),
    catchError(() => {
      tokenStorage.removeAccessToken();
      currentUserService.clearCurrentUser();

      return of(router.createUrlTree(['/auth/sign-in']));
    }),
  );
};