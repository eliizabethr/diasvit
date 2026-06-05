import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/home-page/home-page').then(
        (m) => m.HomePage,
      ),
  },
  {
    path: 'auth/sign-in',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/sign-in-page/sign-in-page').then(
        (m) => m.SignInPage,
      ),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-page/register-page').then(
        (m) => m.RegisterPage,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile-page/profile-page').then(
        (m) => m.ProfilePage,
      ),
  },
  {
    path: 'profile/applications/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/profile/create-application-page/create-application-page'
      ).then((m) => m.CreateApplicationPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then(
        (m) => m.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard-page/admin-dashboard-page').then(
            (m) => m.AdminDashboardPage,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users-page/admin-users-page').then(
            (m) => m.AdminUsersPage,
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/admin/admin-applications-page/admin-applications-page').then(
            (m) => m.AdminApplicationsPage,
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/admin/admin-items-page/admin-items-page').then(
            (m) => m.AdminItemsPage,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/admin-reports-page/admin-reports-page').then(
            (m) => m.AdminReportsPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
