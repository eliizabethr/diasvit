import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { ApplicationSuccessDialog } from '../../../shared/dialogs/application-success-dialog/application-success-dialog';
import { CreateApplicationPage } from './create-application-page';

describe('CreateApplicationPage', () => {
  let component: CreateApplicationPage;
  let fixture: ComponentFixture<CreateApplicationPage>;
  let createApplication: ReturnType<typeof vi.fn>;
  let openDialog: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    createApplication = vi.fn();
    openDialog = vi.fn();

    await TestBed.configureTestingModule({
      imports: [CreateApplicationPage],
      providers: [
        provideRouter([]),
        {
          provide: CurrentUserService,
          useValue: {
            currentUser: signal({
              id: 1,
              phone: '+380993871212',
              firstName: 'Іван',
              middleName: 'Іванович',
              lastName: 'Іваненко',
              dateOfBirth: '1990-01-01',
              roles: ['user'],
            }),
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

    fixture = TestBed.createComponent(CreateApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the application success dialog after submission', () => {
    createApplication.mockReturnValue(of({}));
    component.form.controls.items.at(0).patchValue({
      itemId: 1,
      quantity: 1,
    });

    component.submit();

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
