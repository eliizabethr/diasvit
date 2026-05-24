import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminApplicationsPage } from './admin-applications-page';

describe('AdminApplicationsPage', () => {
  let component: AdminApplicationsPage;
  let fixture: ComponentFixture<AdminApplicationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminApplicationsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
