import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemsService } from '../../../core/services/items.service';
import { AddItemDialog } from './add-item-dialog';

describe('AddItemDialog', () => {
  let component: AddItemDialog;
  let fixture: ComponentFixture<AddItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItemDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(() => ({
              afterClosed: () => of(undefined),
            })),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            createAdminInventoryItem: vi.fn(),
          },
        },
        {
          provide: ItemCategoriesService,
          useValue: {
            getAdminItemCategories: vi.fn(() =>
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItemDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
