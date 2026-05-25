export class AidByCategoriesReportItemDto {
  categoryId!: number;
  categoryName!: string;
  receivedQuantity!: number;
  issuedQuantity!: number;
  currentStock!: number;
}

export class AidByCategoriesResponseDto {
  dateFrom!: string | null;
  dateTo!: string | null;
  data!: AidByCategoriesReportItemDto[];
}
