import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly footerText = input<string>();
  readonly footerLinkText = input<string>();
  readonly footerLink = input<string>();
}
