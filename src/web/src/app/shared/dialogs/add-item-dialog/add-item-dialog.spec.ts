import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemDialog } from './add-item-dialog';

describe('AddItemDialog', () => {
  let component: AddItemDialog;
  let fixture: ComponentFixture<AddItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItemDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItemDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
