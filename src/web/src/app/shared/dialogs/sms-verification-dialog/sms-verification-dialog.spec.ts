import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsVerificationDialog } from './sms-verification-dialog';

describe('SmsVerificationDialog', () => {
  let component: SmsVerificationDialog;
  let fixture: ComponentFixture<SmsVerificationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsVerificationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(SmsVerificationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
