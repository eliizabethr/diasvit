import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AidByCategoriesReportParams,
  AidByCategoriesReportResponse,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAidByCategoriesReport(
    params: AidByCategoriesReportParams,
  ): Observable<AidByCategoriesReportResponse> {
    return this.http
      .get<AidByCategoriesReportResponse>(
        `${this.apiUrl}/admin/reports/aid-by-categories`, {
        params: this.buildParams(params),
      });
  }

  exportAidByCategoriesReport(params: AidByCategoriesReportParams): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/admin/reports/aid-by-categories/export`, {
        params: this.buildParams(params),
        responseType: 'blob',
      });
  }

  private buildParams(params: AidByCategoriesReportParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });

    return httpParams;
  }
}