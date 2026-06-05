import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MatDialogRef } from '@angular/material/dialog';

import { ItemsService } from '../../../core/services/items.service';
import { InventoryOperationDialog } from './inventory-operation-dialog';

describe('InventoryOperationDialog', () => {
  let component: InventoryOperationDialog;
  let fixture: ComponentFixture<InventoryOperationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOperationDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
        {
          provide: ItemsService,
          useValue: {
            getAdminInventoryItems: vi.fn(() =>
              of({
                data: [],
                page: 1,
                limit: 100,
                total: 0,
                totalPages: 0,
              }),
            ),
            createInventoryOperation: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryOperationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
