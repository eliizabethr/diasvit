import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationCommentDialog } from './application-comment-dialog';

describe('ApplicationCommentDialog', () => {
  let component: ApplicationCommentDialog;
  let fixture: ComponentFixture<ApplicationCommentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationCommentDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationCommentDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
