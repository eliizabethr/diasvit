import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorResponse } from '../../core/models/api-error.model';

export function getApiErrorMessage(error: unknown): string {
  const fallbackMessage = 'Сталася помилка. Спробуйте ще раз.';

  if (!(error instanceof HttpErrorResponse)) {
    return fallbackMessage;
  }

  const apiError = error.error as Partial<ApiErrorResponse> | undefined;

  if (!apiError?.message) {
    return fallbackMessage;
  }

  if (Array.isArray(apiError.message)) {
    return apiError.message.join('\n');
  }

  return apiError.message;
}