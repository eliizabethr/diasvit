import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ApplicationCommentDialogData {
  title: string;
  comment: string;
}

@Component({
  selector: 'app-application-comment-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './application-comment-dialog.html',
  styleUrl: './application-comment-dialog.scss',
})
export class ApplicationCommentDialog {
  private readonly dialogRef = inject(MatDialogRef<ApplicationCommentDialog>);
  readonly data = inject<ApplicationCommentDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}