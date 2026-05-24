import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import {
  AdminUser,
  AdminUsersQueryParams,
  CreateAdminUserRequest,
  CurrentUser,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`);
  }

  getAdminUsers(params: AdminUsersQueryParams = {}): Observable<PaginatedResponse<AdminUser>> {
    return this.http.get<PaginatedResponse<AdminUser>>(`${this.apiUrl}/admin/users`, {
      params: this.buildParams(params as Record<string, unknown>),
    });
  }

  createAdminUser(payload: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/admin/users`, payload);
  }

  private buildParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}