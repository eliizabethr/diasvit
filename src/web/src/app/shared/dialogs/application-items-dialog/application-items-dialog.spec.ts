import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationItemsDialog } from './application-items-dialog';

describe('ApplicationItemsDialog', () => {
  let component: ApplicationItemsDialog;
  let fixture: ComponentFixture<ApplicationItemsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationItemsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationItemsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
