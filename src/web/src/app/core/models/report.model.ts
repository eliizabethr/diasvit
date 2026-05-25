export interface AidByCategoryReportItem {
  categoryId: number;
  categoryName: string;
  receivedQuantity: number;
  issuedQuantity: number;
  currentStock: number;
}

export interface AidByCategoriesReportResponse {
  dateFrom: string | null;
  dateTo: string | null;
  data: AidByCategoryReportItem[];
  // totals: {
  //   received: number;
  //   issued: number;
  //   remaining: number;
  // };
  // categories: AidByCategoryReportItem[];
}

export interface AidByCategoriesReportParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface AidByCategoriesReportTotals {
  receivedQuantity: number;
  issuedQuantity: number;
  currentStock: number;
}