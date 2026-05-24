import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateApplicationPage } from './create-application-page';

describe('CreateApplicationPage', () => {
  let component: CreateApplicationPage;
  let fixture: ComponentFixture<CreateApplicationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateApplicationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
