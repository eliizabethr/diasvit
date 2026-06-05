import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
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
            currentUser: signal(null),
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
            createMyApplication: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
