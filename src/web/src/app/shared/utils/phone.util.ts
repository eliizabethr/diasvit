import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const COUNTRY_CODE = '38';
const INTERNATIONAL_PREFIX = '380';
const INTERNATIONAL_PHONE_LENGTH = 12;

function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function normalizeUkrainianPhoneDigits(value: string | null | undefined): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return '';
  }

  if (digits.startsWith(INTERNATIONAL_PREFIX) || digits.startsWith(COUNTRY_CODE)) {
    return digits.slice(0, INTERNATIONAL_PHONE_LENGTH);
  }

  if (digits.startsWith('0')) {
    return `${COUNTRY_CODE}${digits}`.slice(0, INTERNATIONAL_PHONE_LENGTH);
  }

  return `${INTERNATIONAL_PREFIX}${digits}`.slice(0, INTERNATIONAL_PHONE_LENGTH);
}

export function formatUkrainianPhoneInput(value: string | null | undefined): string {
  const rawDigits = onlyDigits(value);

  if (!rawDigits || rawDigits === COUNTRY_CODE) {
    return '';
  }

  const normalizedDigits = normalizeUkrainianPhoneDigits(value);
  const nationalDigits = normalizedDigits.startsWith(COUNTRY_CODE)
    ? normalizedDigits.slice(COUNTRY_CODE.length)
    : normalizedDigits;

  if (!nationalDigits) {
    return '';
  }

  const operatorCode = nationalDigits.slice(0, 3);
  const firstPart = nationalDigits.slice(3, 6);
  const secondPart = nationalDigits.slice(6, 8);
  const thirdPart = nationalDigits.slice(8, 10);

  let formattedValue = '+38';

  if (operatorCode) {
    formattedValue += ` (${operatorCode}`;
  }

  if (operatorCode.length === 3) {
    formattedValue += ')';
  }

  if (firstPart) {
    formattedValue += ` ${firstPart}`;
  }

  if (secondPart) {
    formattedValue += `-${secondPart}`;
  }

  if (thirdPart) {
    formattedValue += `-${thirdPart}`;
  }

  return formattedValue;
}

export function isValidUkrainianPhone(value: string | null | undefined): boolean {
  return /^380\d{9}$/.test(normalizeUkrainianPhoneDigits(value));
}

export function ukrainianPhoneValidator(): ValidatorFn {
  return (control: AbstractControl<string | null | undefined>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    return isValidUkrainianPhone(control.value) ? null : { ukrainianPhone: true };
  };
}
