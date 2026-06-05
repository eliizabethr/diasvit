import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ApplicationItemsDialog } from './application-items-dialog';

describe('ApplicationItemsDialog', () => {
  let component: ApplicationItemsDialog;
  let fixture: ComponentFixture<ApplicationItemsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationItemsDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            application: {
              id: 642,
              createdAt: '2024-05-12',
              updatedAt: '2024-05-12',
              fulfillmentType: 'pickup',
              deliveryCity: null,
              deliveryAddress: null,
              pickupLocation: 'Самовивіз',
              pickupDate: null,
              comment: null,
              status: 'new',
              items: [
                {
                  id: 1,
                  name: 'Метформін',
                  quantity: 2,
                  unit: 'уп.',
                },
              ],
            },
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationItemsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
