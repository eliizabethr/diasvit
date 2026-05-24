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
        `${this.apiUrl}/admin/reports/aid-by-categories`,
        {
          params: this.buildParams(params),
        },
      )
      .pipe(
        catchError((error) => {
          if (!environment.useReportMockFallback) {
            throw error;
          }

          return of(this.createMockReport(params));
        }),
      );
  }

  exportAidByCategoriesReport(params: AidByCategoriesReportParams): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/admin/reports/aid-by-categories/export`, {
        params: this.buildParams(params),
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          if (!environment.useReportMockFallback) {
            throw error;
          }

          const report = this.createMockReport(params);
          return of(this.createCsvBlob(report));
        }),
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

  private createMockReport(params: AidByCategoriesReportParams): AidByCategoriesReportResponse {
    const categories = [
      {
        categoryId: 1,
        categoryName: 'Інсуліни та голки',
        received: 42,
        issued: 31,
        remaining: 11,
      },
      {
        categoryId: 2,
        categoryName: 'Глюкометри',
        received: 18,
        issued: 9,
        remaining: 9,
      },
      {
        categoryId: 3,
        categoryName: 'Тест-смужки',
        received: 96,
        issued: 64,
        remaining: 32,
      },
      {
        categoryId: 4,
        categoryName: 'Сенсори моніторингу',
        received: 24,
        issued: 15,
        remaining: 9,
      },
      {
        categoryId: 5,
        categoryName: 'Інсулінові помпи',
        received: 5,
        issued: 2,
        remaining: 3,
      },
      {
        categoryId: 6,
        categoryName: 'Вітаміни',
        received: 60,
        issued: 44,
        remaining: 16,
      },
    ];

    return {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      totals: {
        received: categories.reduce((sum, item) => sum + item.received, 0),
        issued: categories.reduce((sum, item) => sum + item.issued, 0),
        remaining: categories.reduce((sum, item) => sum + item.remaining, 0),
      },
      categories,
    };
  }

  private createCsvBlob(report: AidByCategoriesReportResponse): Blob {
    const rows = [
      ['Категорія', 'Надійшло', 'Видано', 'Залишок'],
      ...report.categories.map((item) => [
        item.categoryName,
        String(item.received),
        String(item.issued),
        String(item.remaining),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(';'))
      .join('\n');

    return new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
  }
}