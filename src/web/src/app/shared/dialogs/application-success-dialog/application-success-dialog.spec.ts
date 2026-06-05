import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { MatDialogRef } from '@angular/material/dialog';

import { ApplicationSuccessDialog } from './application-success-dialog';

describe('ApplicationSuccessDialog', () => {
  let component: ApplicationSuccessDialog;
  let fixture: ComponentFixture<ApplicationSuccessDialog>;
  let afterClosed: Subject<void>;
  let dialogRef: {
    close: ReturnType<typeof vi.fn>;
    afterClosed: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    afterClosed = new Subject<void>();
    dialogRef = {
      close: vi.fn(),
      afterClosed: vi.fn(() => afterClosed.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationSuccessDialog],
      providers: [
        provideRouter([]),
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(ApplicationSuccessDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render cabinet and home actions', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Перейти до кабінету');
    expect(text).toContain('На головну');
  });

  it('should navigate home and smoothly scroll to the top', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    component.goHome();
    afterClosed.next();
    afterClosed.complete();
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve));

    expect(dialogRef.close).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
});
