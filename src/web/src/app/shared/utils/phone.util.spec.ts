import { FormControl } from '@angular/forms';

import {
  formatUkrainianPhoneInput,
  isValidUkrainianPhone,
  normalizeUkrainianPhoneDigits,
  ukrainianPhoneValidator,
} from './phone.util';

describe('phone util', () => {
  it('formats a partial Ukrainian phone number progressively', () => {
    expect(formatUkrainianPhoneInput('06712')).toBe('+38 (067) 12');
  });

  it('formats a full Ukrainian phone number', () => {
    expect(formatUkrainianPhoneInput('0671234567')).toBe('+38 (067) 123-45-67');
    expect(formatUkrainianPhoneInput('+380671234567')).toBe('+38 (067) 123-45-67');
  });

  it('normalizes formatted input to plain digits for the backend', () => {
    expect(normalizeUkrainianPhoneDigits('+38 (067) 123-45-67')).toBe('380671234567');
  });

  it('validates complete Ukrainian phone numbers', () => {
    expect(isValidUkrainianPhone('+38 (067) 123-45-67')).toBe(true);
    expect(isValidUkrainianPhone('+38 (067) 123-45')).toBe(false);
  });

  it('returns a validation error for incomplete phone values', () => {
    const validator = ukrainianPhoneValidator();

    expect(validator(new FormControl('+38 (067) 123-45-67'))).toBeNull();
    expect(validator(new FormControl('+38 (067) 123-45'))).toEqual({
      ukrainianPhone: true,
    });
  });
});
