import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemCategoryDialog } from './add-item-category-dialog';

describe('AddItemCategoryDialog', () => {
  let component: AddItemCategoryDialog;
  let fixture: ComponentFixture<AddItemCategoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItemCategoryDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItemCategoryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
