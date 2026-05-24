import { PaginatedResponse } from '../../core/models/pagination.model';

export function getPaginationRange<T>(pagination: PaginatedResponse<T>): string {
  if (pagination.total === 0) {
    return 'Показано 0 з 0';
  }

  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return `Показано ${start}-${end} з ${pagination.total}`;
}