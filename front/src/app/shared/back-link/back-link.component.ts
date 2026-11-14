import { Component, input } from '@angular/core';
import { MatIconAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';

/**
 * The back arrow of the mockup: an icon link to another page. Each page places it.
 */
@Component({
  imports: [MatIconAnchor, RouterLink],
  selector: 'app-back-link',
  styleUrl: './back-link.component.scss',
  templateUrl: './back-link.component.html',
})
export class BackLink {
  // The address of the page it leads to
  readonly link = input.required<string>();
  // What it does, for screen readers, which cannot see the arrow
  readonly label = input.required<string>();
}
