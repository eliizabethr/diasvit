import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { CurrentUser } from '../../../core/models/user.model';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let currentUser: WritableSignal<CurrentUser | null>;

  beforeEach(async () => {
    currentUser = signal<CurrentUser | null>({
      id: 1,
      phone: '+380501234567',
      firstName: 'Олена',
      middleName: 'Петрівна',
      lastName: 'Іваненко',
      dateOfBirth: '1999-09-28',
      roles: ['user'],
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            logout: vi.fn(),
          },
        },
        {
          provide: CurrentUserService,
          useValue: {
            currentUser,
            clearCurrentUser: vi.fn(),
            loadCurrentUser: vi.fn(() => of(currentUser()!)),
          },
        },
        {
          provide: ApplicationsService,
          useValue: {
            getMyApplications: vi.fn(() =>
              of({
                data: [],
                page: 1,
                limit: 5,
                total: 0,
                totalPages: 0,
              }),
            ),
          },
        },
      ],
    });

    TestBed.overrideProvider(MatDialog, {
      useValue: {
        open: vi.fn(),
      },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
