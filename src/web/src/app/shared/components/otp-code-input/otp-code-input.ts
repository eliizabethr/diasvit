import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-otp-code-input',
  imports: [CommonModule],
  templateUrl: './otp-code-input.html',
  styleUrl: './otp-code-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpCodeInput),
      multi: true,
    },
  ],
})
export class OtpCodeInput implements ControlValueAccessor {
  readonly length = input(6);
  readonly disabled = input(false);
  readonly codeCompleted = output<string>();

  @ViewChildren('codeInput')
  private readonly codeInputs?: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = Array.from({ length: this.length() }, () => '');

  private isDisabled = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const normalizedValue = value ?? '';

    this.digits = Array.from({ length: this.length() }, (_, index) => {
      return normalizedValue[index] ?? '';
    });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.replace(/\D/g, '');

    if (!value) {
      this.digits[index] = '';
      this.emitValue();
      return;
    }

    if (value.length > 1) {
      this.handlePasteValue(value, index);
      return;
    }

    this.digits[index] = value;
    inputElement.value = value;
    this.emitValue();

    if (index < this.length() - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Backspace') {
      return;
    }

    if (this.digits[index]) {
      this.digits[index] = '';
      this.emitValue();
      return;
    }

    if (index > 0) {
      this.focusInput(index - 1);
    }
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();

    const pastedValue = event.clipboardData?.getData('text') ?? '';
    this.handlePasteValue(pastedValue, index);
  }

  onBlur(): void {
    this.onTouched();
  }

  isInputDisabled(): boolean {
    return this.isDisabled || this.disabled();
  }

  private handlePasteValue(value: string, startIndex: number): void {
    const numbers = value.replace(/\D/g, '').slice(0, this.length() - startIndex);

    if (!numbers) {
      return;
    }

    numbers.split('').forEach((digit, offset) => {
      this.digits[startIndex + offset] = digit;
    });

    this.emitValue();

    const nextIndex = Math.min(startIndex + numbers.length, this.length() - 1);
    this.focusInput(nextIndex);
  }

  private emitValue(): void {
    const code = this.digits.join('');

    this.onChange(code);

    if (code.length === this.length() && this.digits.every(Boolean)) {
      this.codeCompleted.emit(code);
    }
  }

  private focusInput(index: number): void {
    const input = this.codeInputs?.get(index)?.nativeElement;
    input?.focus();
    input?.select();
  }
}