import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateItemCategoryRequest,
  ItemCategory,
} from '../models/item-category.model';
import { PaginationParams, PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class ItemCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getItemCategories(params: PaginationParams = {}): Observable<PaginatedResponse<ItemCategory>> {
    return this.http.get<PaginatedResponse<ItemCategory>>(`${this.apiUrl}/item-categories`, {
      params: this.buildParams(params as Record<string, unknown>),
    });
  }

  getAdminItemCategories(
    params: PaginationParams = {},
  ): Observable<PaginatedResponse<ItemCategory>> {
    return this.http.get<PaginatedResponse<ItemCategory>>(
      `${this.apiUrl}/admin/item-categories`,
      {
        params: this.buildParams(params as Record<string, unknown>),
      },
    );
  }

  createAdminItemCategory(payload: CreateItemCategoryRequest): Observable<ItemCategory> {
    return this.http.post<ItemCategory>(`${this.apiUrl}/admin/item-categories`, payload);
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