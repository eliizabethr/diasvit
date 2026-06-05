import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { ApplicationSuccessDialog } from '../../../shared/dialogs/application-success-dialog/application-success-dialog';
import { SmsVerificationDialog } from '../../../shared/dialogs/sms-verification-dialog/sms-verification-dialog';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let currentUser: WritableSignal<unknown>;
  let createApplication: ReturnType<typeof vi.fn>;
  let openDialog: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    currentUser = signal<unknown>(null);
    createApplication = vi.fn();
    openDialog = vi.fn(() => ({
      afterClosed: () => of(undefined),
    }));

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: vi.fn(() => false),
            logout: vi.fn(),
            register: vi.fn(),
            requestCode: vi.fn(),
          },
        },
        {
          provide: CurrentUserService,
          useValue: {
            currentUser,
            clearCurrentUser: vi.fn(),
            loadCurrentUser: vi.fn(),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            getItems: vi.fn(() =>
              of({
                data: [],
                page: 1,
                limit: 100,
                total: 0,
                totalPages: 0,
              }),
            ),
          },
        },
        {
          provide: ApplicationsService,
          useValue: {
            createMyApplication: createApplication,
          },
        },
      ],
    });

    TestBed.overrideProvider(MatDialog, {
      useValue: {
        open: openDialog,
      },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the SMS verification dialog with the compact OTP panel config', () => {
    component.form.patchValue({
      phone: '+380993871212',
    });

    const openSmsDialog = (
      component as unknown as { openSmsDialog: () => void }
    ).openSmsDialog.bind(component);

    openSmsDialog();

    expect(openDialog).toHaveBeenCalledWith(SmsVerificationDialog, {
      data: {
        phone: '+380993871212',
        purpose: 'register',
        title: 'Введіть код підтвердження',
        subtitle: 'Код із SMS надіслано на номер',
      },
      width: 'min(620px, calc(100vw - 24px))',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100vh - 24px)',
      panelClass: ['app-dialog-panel', 'sms-verification-dialog-panel'],
      disableClose: true,
      autoFocus: 'first-tabbable',
    });
  });

  it('should open the application success dialog after an authenticated submission', () => {
    currentUser.set({
      id: 1,
      phone: '+380993871212',
      firstName: 'Іван',
      middleName: 'Іванович',
      lastName: 'Іваненко',
      dateOfBirth: '1990-01-01',
      roles: ['user'],
    });
    createApplication.mockReturnValue(of({}));
    component.form.patchValue({
      lastName: 'Іваненко',
      firstName: 'Іван',
      middleName: 'Іванович',
      dateOfBirth: new Date(1990, 0, 1),
      phone: '+380993871212',
    });
    component.form.controls.items.at(0).patchValue({
      itemId: 1,
      quantity: 1,
    });

    component.submitApplication();

    expect(openDialog).toHaveBeenCalledWith(ApplicationSuccessDialog, {
      width: 'min(1060px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 64px)',
      panelClass: ['app-dialog-panel', 'application-success-dialog-panel'],
      backdropClass: 'application-success-dialog-backdrop',
      disableClose: true,
      autoFocus: false,
    });
  });
});
