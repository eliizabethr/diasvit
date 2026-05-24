import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpCodeInput } from './otp-code-input';

describe('OtpCodeInput', () => {
  let component: OtpCodeInput;
  let fixture: ComponentFixture<OtpCodeInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpCodeInput],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpCodeInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
