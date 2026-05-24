import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReportsPage } from './admin-reports-page';

describe('AdminReportsPage', () => {
  let component: AdminReportsPage;
  let fixture: ComponentFixture<AdminReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReportsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReportsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
