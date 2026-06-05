import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import {
  CreateApplicationRequest,
  FulfillmentType,
} from '../../core/models/application.model';

export type AidApplicationItemForm = FormGroup<{
  itemId: FormControl<number>;
  quantity: FormControl<number>;
}>;

export type AidApplicationForm = FormGroup<{
  lastName: FormControl<string>;
  firstName: FormControl<string>;
  middleName: FormControl<string>;
  dateOfBirth: FormControl<Date | null>;
  phone: FormControl<string>;
  fulfillmentType: FormControl<string>;
  deliveryCity: FormControl<string>;
  deliveryAddress: FormControl<string>;
  pickupLocation: FormControl<string>;
  comment: FormControl<string>;
  items: FormArray<AidApplicationItemForm>;
}>;

export function createAidApplicationForm(
  fb: NonNullableFormBuilder,
): AidApplicationForm {
  return fb.group({
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: new FormControl<Date | null>(null, [Validators.required]),
    phone: ['', [Validators.required, Validators.pattern(/^\+?380\d{9}$/)]],
    fulfillmentType: ['pickup', [Validators.required]],
    deliveryCity: [''],
    deliveryAddress: [''],
    pickupLocation: ['Запоріжжя'],
    comment: [''],
    items: fb.array([createAidApplicationItemGroup(fb)]),
  });
}

export function parseAidApplicationDateOfBirth(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatAidApplicationDateOfBirth(value: Date | null): string {
  if (!value) {
    return '';
  }

  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${value.getFullYear()}-${month}-${day}`;
}

export function createAidApplicationItemGroup(
  fb: NonNullableFormBuilder,
): AidApplicationItemForm {
  return fb.group({
    itemId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });
}

export function updateAidApplicationDeliveryValidators(
  form: AidApplicationForm,
  type: string,
): void {
  const deliveryCityControl = form.controls.deliveryCity;
  const deliveryAddressControl = form.controls.deliveryAddress;

  if (type === 'delivery') {
    deliveryCityControl.setValidators([Validators.required]);
    deliveryAddressControl.setValidators([Validators.required]);
  } else {
    deliveryCityControl.clearValidators();
    deliveryAddressControl.clearValidators();
    deliveryCityControl.setValue('');
    deliveryAddressControl.setValue('');
  }

  deliveryCityControl.updateValueAndValidity();
  deliveryAddressControl.updateValueAndValidity();
}

export function setAidApplicationContactFieldsDisabled(
  form: AidApplicationForm,
  isDisabled: boolean,
): void {
  const controls = [
    form.controls.lastName,
    form.controls.firstName,
    form.controls.middleName,
    form.controls.dateOfBirth,
    form.controls.phone,
  ];

  controls.forEach((control) => {
    if (isDisabled) {
      control.disable();
    } else {
      control.enable();
    }
  });
}

export function buildAidApplicationPayload(
  form: AidApplicationForm,
): CreateApplicationRequest {
  const formValue = form.getRawValue();

  return {
    fulfillmentType: formValue.fulfillmentType as FulfillmentType,
    deliveryCity:
      formValue.fulfillmentType === 'delivery' ? formValue.deliveryCity : undefined,
    deliveryAddress:
      formValue.fulfillmentType === 'delivery' ? formValue.deliveryAddress : undefined,
    pickupLocation:
      formValue.fulfillmentType === 'pickup' ? formValue.pickupLocation : undefined,
    comment: formValue.comment || undefined,
    items: formValue.items.map((item) => ({
      itemId: Number(item.itemId),
      quantity: Number(item.quantity),
    })),
  };
}
