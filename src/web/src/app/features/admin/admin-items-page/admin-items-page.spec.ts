import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminItemsPage } from './admin-items-page';

describe('AdminItemsPage', () => {
  let component: AdminItemsPage;
  let fixture: ComponentFixture<AdminItemsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminItemsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminItemsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
