import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminInventoryItemsQueryParams,
  CreateInventoryItemRequest,
  CreateInventoryOperationRequest,
  InventoryItem,
  InventoryOperation,
  UpdateInventoryItemRequest,
  UserItem,
} from '../models/item.model';
import { PaginationParams, PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getItems(params: PaginationParams = {}): Observable<PaginatedResponse<UserItem>> {
    return this.http.get<PaginatedResponse<UserItem>>(`${this.apiUrl}/items`, {
      params: this.buildParams(params as Record<string, unknown>),
    });
  }

  getAdminInventoryItems(
    params: AdminInventoryItemsQueryParams = {},
  ): Observable<PaginatedResponse<InventoryItem>> {
    return this.http.get<PaginatedResponse<InventoryItem>>(
      `${this.apiUrl}/admin/inventory/items`,
      {
        params: this.buildParams(params as Record<string, unknown>),
      },
    );
  }

  createAdminInventoryItem(payload: CreateInventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.apiUrl}/admin/inventory/items`,
      payload,
    );
  }

  updateAdminInventoryItem(
    id: number,
    payload: UpdateInventoryItemRequest,
  ): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(
      `${this.apiUrl}/admin/inventory/items/${id}`,
      payload,
    );
  }

  createInventoryOperation(
    itemId: number,
    payload: CreateInventoryOperationRequest,
  ): Observable<InventoryOperation> {
    return this.http.post<InventoryOperation>(
      `${this.apiUrl}/admin/inventory/items/${itemId}/operations`,
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