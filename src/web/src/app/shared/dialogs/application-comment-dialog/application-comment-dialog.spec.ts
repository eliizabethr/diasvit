import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ApplicationCommentDialog } from './application-comment-dialog';

describe('ApplicationCommentDialog', () => {
  let component: ApplicationCommentDialog;
  let fixture: ComponentFixture<ApplicationCommentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationCommentDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Коментар до заявки #2024-0642',
            comment: 'Тестовий коментар',
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

    fixture = TestBed.createComponent(ApplicationCommentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
