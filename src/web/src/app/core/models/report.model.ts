export interface AidByCategoryReportItem {
  categoryId: number;
  categoryName: string;
  received: number;
  issued: number;
  remaining: number;
}

export interface AidByCategoriesReportResponse {
  dateFrom: string;
  dateTo: string;
  totals: {
    received: number;
    issued: number;
    remaining: number;
  };
  categories: AidByCategoryReportItem[];
}

export interface AidByCategoriesReportParams {
  dateFrom: string;
  dateTo: string;
  [key: string]: unknown; // workaround for Typescript strict-type checking
}