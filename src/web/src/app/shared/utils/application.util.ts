import {
  AdminApplication,
  UserApplication,
} from '../../core/models/application.model';
import {
  APPLICATION_STATUS_LABELS,
  FULFILLMENT_TYPE_LABELS,
} from '../../core/models/ui-labels';

type ApplicationLike = UserApplication | AdminApplication;

export function getApplicationStatusLabel(status: ApplicationLike['status']): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export function getFulfillmentTypeLabel(type: ApplicationLike['fulfillmentType']): string {
  return FULFILLMENT_TYPE_LABELS[type] ?? type;
}

export function formatApplicationNumber(application: Pick<ApplicationLike, 'id' | 'createdAt'>): string {
  const year = new Date(application.createdAt).getFullYear();

  if (Number.isNaN(year)) {
    return `#${application.id}`;
  }

  return `#${year}-${String(application.id).padStart(4, '0')}`;
}

export function formatApplicationItemsShort(
  application: Pick<ApplicationLike, 'items'>,
  maxVisibleItems = 2,
): string {
  if (!application.items.length) {
    return '—';
  }

  const visibleItems = application.items.slice(0, maxVisibleItems);

  const summary = visibleItems
    .map((applicationItem) => {
      const unit = applicationItem.item.unit;
      return `${applicationItem.item.name} — ${applicationItem.quantity} ${unit}`;
    })
    .join('; ');

  const hiddenCount = application.items.length - visibleItems.length;

  if (hiddenCount <= 0) {
    return summary;
  }

  return `${summary}; ще ${hiddenCount}`;
}

export function formatApplicationFulfillment(application: ApplicationLike): string {
  if (application.fulfillmentType === 'pickup') {
    return application.pickupLocation || 'Самовивіз';
  }

  return [application.deliveryCity, application.deliveryAddress]
    .filter(Boolean)
    .join(', ') || 'Доставка';
}