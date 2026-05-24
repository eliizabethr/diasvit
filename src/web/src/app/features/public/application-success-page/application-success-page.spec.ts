import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSuccessPage } from './application-success-page';

describe('ApplicationSuccessPage', () => {
  let component: ApplicationSuccessPage;
  let fixture: ComponentFixture<ApplicationSuccessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationSuccessPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationSuccessPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
