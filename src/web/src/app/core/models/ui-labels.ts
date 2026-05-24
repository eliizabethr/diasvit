import { ApplicationStatus, FulfillmentType } from './application.model';
import { UserRole } from './user.model';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Нова',
  in_review: 'В обробці',
  approved: 'Схвалена',
  rejected: 'Відхилена',
  preparing: 'Готується',
  ready_for_delivery: 'Готова до відправки',
  ready_for_pickup: 'Готова до самовивозу',
  shipped: 'Відправлена',
  completed: 'Виконана',
  cancelled: 'Скасована',
};

export const FULFILLMENT_TYPE_LABELS: Record<FulfillmentType, string> = {
  pickup: 'Самовивіз',
  delivery: 'Доставка',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: 'Користувач',
  admin: 'Адміністратор',
};