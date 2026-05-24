import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateItemDialog } from './update-item-dialog';

describe('UpdateItemDialog', () => {
  let component: UpdateItemDialog;
  let fixture: ComponentFixture<UpdateItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateItemDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateItemDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
