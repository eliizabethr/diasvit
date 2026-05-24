import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminApplication,
  AdminApplicationsQueryParams,
  ChangeApplicationStatusRequest,
  CreateApplicationRequest,
  MyApplicationsQueryParams,
  UpdateApplicationAdminRequest,
  UserApplication,
} from '../models/application.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  createMyApplication(payload: CreateApplicationRequest): Observable<UserApplication> {
    return this.http.post<UserApplication>(`${this.apiUrl}/me/applications`, payload);
  }

  getMyApplications(
    params: MyApplicationsQueryParams = {},
  ): Observable<PaginatedResponse<UserApplication>> {
    return this.http.get<PaginatedResponse<UserApplication>>(`${this.apiUrl}/me/applications`, {
      params: this.buildParams(params as Record<string, unknown>),
    });
  }

  getMyApplicationById(id: number): Observable<UserApplication> {
    return this.http.get<UserApplication>(`${this.apiUrl}/me/applications/${id}`);
  }

  getAdminApplications(
    params: AdminApplicationsQueryParams = {},
  ): Observable<PaginatedResponse<AdminApplication>> {
    return this.http.get<PaginatedResponse<AdminApplication>>(
      `${this.apiUrl}/admin/applications`,
      {
        params: this.buildParams(params as Record<string, unknown>),
      },
    );
  }

  getAdminApplicationById(id: number): Observable<AdminApplication> {
    return this.http.get<AdminApplication>(`${this.apiUrl}/admin/applications/${id}`);
  }

  updateAdminApplication(
    id: number,
    payload: UpdateApplicationAdminRequest,
  ): Observable<AdminApplication> {
    return this.http.patch<AdminApplication>(`${this.apiUrl}/admin/applications/${id}`, payload);
  }

  changeAdminApplicationStatus(
    id: number,
    payload: ChangeApplicationStatusRequest,
  ): Observable<AdminApplication> {
    return this.http.patch<AdminApplication>(
      `${this.apiUrl}/admin/applications/${id}/status`,
      payload,
    );
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