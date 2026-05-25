import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AidByCategoriesReportResponse, AidByCategoriesReportTotals } from '../../../core/models/report.model';
import { ReportsService } from '../../../core/services/reports.service';
import { getApiErrorMessage } from '../../../shared/utils/api-error.util';
import { formatDate } from '../../../shared/utils/date.util';

@Component({
  selector: 'app-admin-reports-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './admin-reports-page.html',
  styleUrl: './admin-reports-page.scss',
})
export class AdminReportsPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reportsService = inject(ReportsService);

  readonly form = this.fb.group({
    dateFrom: ['', [Validators.required]],
    dateTo: ['', [Validators.required]],
  });

  readonly report = signal<AidByCategoriesReportResponse | null>(null);
  readonly isLoading = signal(false);
  readonly isExporting = signal(false);
  readonly errorMessage = signal('');

  readonly totals = computed<AidByCategoriesReportTotals>(() => {
    const report = this.report();

    if (!report) {
      return {
        receivedQuantity: 0,
        issuedQuantity: 0,
        currentStock: 0,
      };
    }

    return report.data.reduce(
      (totals, item) => {
        totals.receivedQuantity += item.receivedQuantity;
        totals.issuedQuantity += item.issuedQuantity;
        totals.currentStock += item.currentStock;

        return totals;
      },
      {
        receivedQuantity: 0,
        issuedQuantity: 0,
        currentStock: 0,
      },
    );
  });

  ngOnInit(): void {
    const { dateFrom, dateTo } = this.getDefaultPeriod();

    this.form.patchValue({
      dateFrom,
      dateTo,
    });

    this.generateReport();
  }

  generateReport(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dateFrom, dateTo } = this.form.getRawValue();

    if (dateFrom > dateTo) {
      this.errorMessage.set('Дата початку не може бути пізніше дати завершення.');
      return;
    }

    this.isLoading.set(true);

    this.reportsService
      .getAidByCategoriesReport({
        dateFrom,
        dateTo,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (report) => {
          this.report.set(report);
        },
        error: (error) => {
          this.report.set(null);
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  generateAllTimeReport(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.reportsService
      .getAidByCategoriesReport({})
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (report) => {
          this.report.set(report);
        },
        error: (error) => {
          this.report.set(null);
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  exportReport(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dateFrom, dateTo } = this.form.getRawValue();

    if (dateFrom > dateTo) {
      this.errorMessage.set('Дата початку не може бути пізніше дати завершення.');
      return;
    }

    this.isExporting.set(true);

    this.reportsService
      .exportAidByCategoriesReport({
        dateFrom,
        dateTo,
      })
      .pipe(
        finalize(() => {
          this.isExporting.set(false);
        }),
      )
      .subscribe({
        next: (file) => {
          this.downloadFile(file, `aid-report-${dateFrom}-${dateTo}.csv`);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
        },
      });
  }

  formatDate(value: string): string {
    return formatDate(value);
  }

  private getDefaultPeriod(): { dateFrom: string; dateTo: string } {
    const dateTo = new Date();
    const dateFrom = new Date();

    dateFrom.setMonth(dateFrom.getMonth() - 1);

    return {
      dateFrom: this.toDateInputValue(dateFrom),
      dateTo: this.toDateInputValue(dateTo),
    };
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private downloadFile(file: Blob, fileName: string): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }
}