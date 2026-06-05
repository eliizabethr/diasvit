import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';

import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { AddItemCategoryDialog } from './add-item-category-dialog';

describe('AddItemCategoryDialog', () => {
  let component: AddItemCategoryDialog;
  let fixture: ComponentFixture<AddItemCategoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItemCategoryDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
        {
          provide: ItemCategoriesService,
          useValue: {
            createAdminItemCategory: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItemCategoryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
