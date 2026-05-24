import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import {
  AdminApplication,
  AdminApplicationItem,
  UserApplication,
  UserApplicationItem,
} from '../../../core/models/application.model';
import { formatApplicationNumber } from '../../utils/application.util';

export type ApplicationItemsDialogData = {
  application: UserApplication | AdminApplication;
};

@Component({
  selector: 'app-application-items-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './application-items-dialog.html',
  styleUrl: './application-items-dialog.scss',
})
export class ApplicationItemsDialog {
  private readonly dialogRef = inject(MatDialogRef<ApplicationItemsDialog>);
  readonly data = inject<ApplicationItemsDialogData>(MAT_DIALOG_DATA);

  readonly applicationNumber = computed(() => {
    return formatApplicationNumber(this.data.application);
  });

  readonly items = computed(() => {
    return this.data.application.items as Array<UserApplicationItem | AdminApplicationItem>;
  });

  close(): void {
    this.dialogRef.close();
  }
}