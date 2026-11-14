import { Component, input } from '@angular/core';

import { BackLink } from '../../../shared/back-link/back-link.component';

@Component({
  imports: [BackLink],
  selector: 'app-auth-layout',
  styleUrl: './auth-layout.component.scss',
  templateUrl: './auth-layout.component.html',
})
export class AuthLayout {
  readonly heading = input.required<string>();
}
