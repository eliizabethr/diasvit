import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ApplicationStatus } from '../../../core/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../../core/models/ui-labels';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly status = input.required<ApplicationStatus>();

  readonly label = computed(() => {
    return APPLICATION_STATUS_LABELS[this.status()];
  });

  readonly statusClass = computed(() => {
    return `status-badge--${this.status().replaceAll('_', '-')}`;
  });
}
