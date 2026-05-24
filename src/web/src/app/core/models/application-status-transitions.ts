import { ApplicationStatus } from './application.model';

export const ALLOWED_APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  new: ['in_review', 'rejected', 'cancelled'],

  in_review: ['approved', 'rejected', 'cancelled'],

  approved: ['preparing', 'cancelled'],

  preparing: ['ready_for_delivery', 'ready_for_pickup', 'cancelled'],

  ready_for_delivery: ['shipped', 'cancelled'],

  shipped: ['completed', 'cancelled'],

  ready_for_pickup: ['completed', 'cancelled'],

  rejected: [],

  completed: [],

  cancelled: [],
};

export function canTransitionToStatus(
  currentStatus: ApplicationStatus,
  targetStatus: ApplicationStatus,
): boolean {
  if (currentStatus === targetStatus) {
    return true;
  }

  return ALLOWED_APPLICATION_STATUS_TRANSITIONS[currentStatus].includes(targetStatus);
}