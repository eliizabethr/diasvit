import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationsService } from '../../../core/services/applications.service';
import { UsersService } from '../../../core/services/users.service';
import { AdminDashboardPage } from './admin-dashboard-page';

describe('AdminDashboardPage', () => {
  let component: AdminDashboardPage;
  let fixture: ComponentFixture<AdminDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: {
            getAdminUsers: vi.fn(() =>
              of({
                data: [],
                page: 1,
                limit: 1,
                total: 0,
                totalPages: 0,
              }),
            ),
          },
        },
        {
          provide: ApplicationsService,
          useValue: {
            getAdminApplications: vi.fn(() =>
              of({
                data: [],
                page: 1,
                limit: 1,
                total: 0,
                totalPages: 0,
              }),
            ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
