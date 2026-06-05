import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-application-success-dialog',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './application-success-dialog.html',
  styleUrl: './application-success-dialog.scss',
})
export class ApplicationSuccessDialog {
  private readonly dialogRef = inject(MatDialogRef<ApplicationSuccessDialog>);
  private readonly router = inject(Router);

  goToProfile(): void {
    this.closeAndNavigate('/profile');
  }

  goHome(): void {
    this.closeAndNavigate('/', true);
  }

  private closeAndNavigate(url: string, scrollToTop = false): void {
    this.dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
      void this.router.navigateByUrl(url).then(() => {
        if (!scrollToTop) {
          return;
        }

        this.scrollToTop();
      });
    });

    this.dialogRef.close();
  }

  private scrollToTop(): void {
    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    });
  }
}
