import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOperationDialog } from './inventory-operation-dialog';

describe('InventoryOperationDialog', () => {
  let component: InventoryOperationDialog;
  let fixture: ComponentFixture<InventoryOperationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOperationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryOperationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
