import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { CurrentUser } from '../../../core/models/user.model';
import { AdminLayout } from './admin-layout';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;
  let currentUser: WritableSignal<CurrentUser | null>;

  beforeEach(async () => {
    currentUser = signal<CurrentUser | null>({
      id: 1,
      phone: '+380501234567',
      firstName: 'Олена',
      middleName: 'Петрівна',
      lastName: 'Іваненко',
      dateOfBirth: '1999-09-28',
      roles: ['admin'],
    });

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
