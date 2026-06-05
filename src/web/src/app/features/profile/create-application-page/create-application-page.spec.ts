import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ItemsService } from '../../../core/services/items.service';
import { CreateApplicationPage } from './create-application-page';

describe('CreateApplicationPage', () => {
  let component: CreateApplicationPage;
  let fixture: ComponentFixture<CreateApplicationPage>;

  beforeEach(async () => {
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
            createMyApplication: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
