import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ItemCategoriesService } from '../../../core/services/item-categories.service';
import { ItemsService } from '../../../core/services/items.service';
import { UpdateItemDialog } from './update-item-dialog';

describe('UpdateItemDialog', () => {
  let component: UpdateItemDialog;
  let fixture: ComponentFixture<UpdateItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateItemDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            item: {
              id: 1,
              name: 'Метформін',
              currentStock: 10,
              category: {
                id: 1,
                name: 'Ліки',
              },
              unit: 'уп',
              createdAt: '2024-05-12',
              updatedAt: '2024-05-12',
            },
          },
        },
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
            updateAdminInventoryItem: vi.fn(),
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

    fixture = TestBed.createComponent(UpdateItemDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
