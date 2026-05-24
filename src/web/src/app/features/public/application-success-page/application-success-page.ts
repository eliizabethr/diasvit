import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-application-success-page',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './application-success-page.html',
  styleUrl: './application-success-page.scss',
})
export class ApplicationSuccessPage {}