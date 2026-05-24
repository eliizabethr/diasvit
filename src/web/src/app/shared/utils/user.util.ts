import { AdminUser, CurrentUser } from '../../core/models/user.model';

type UserNameLike = Pick<CurrentUser | AdminUser, 'lastName' | 'firstName' | 'middleName'>;

export function formatFullName(user: UserNameLike): string {
  return [user.lastName, user.firstName, user.middleName]
    .filter(Boolean)
    .join(' ');
}

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassedThisYear) {
    age -= 1;
  }

  return age;
}