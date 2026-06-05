import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { SmsVerificationDialog } from './sms-verification-dialog';

describe('SmsVerificationDialog', () => {
  let component: SmsVerificationDialog;
  let fixture: ComponentFixture<SmsVerificationDialog>;
  let dialogRef: {
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SmsVerificationDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            phone: '+380993871212',
            purpose: 'register',
          },
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
        {
          provide: AuthService,
          useValue: {
            requestCode: vi.fn(() => of({})),
            verifyCode: vi.fn(() => of({ token: 'verification-token' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SmsVerificationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render without a visible close button', () => {
    expect(fixture.nativeElement.querySelector('.sms-dialog__close')).toBeNull();
  });
});
