import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createAidApplicationForm } from '../../utils/application-form.util';
import { ApplicationForm } from './application-form';

describe('ApplicationForm', () => {
  let component: ApplicationForm;
  let fixture: ComponentFixture<ApplicationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationForm],
      providers: [provideRouter([])],
    }).compileComponents();

    const fb = TestBed.inject(NonNullableFormBuilder);

    fixture = TestBed.createComponent(ApplicationForm);
    fixture.componentRef.setInput('form', createAidApplicationForm(fb));
    fixture.componentRef.setInput('items', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
