import { Component, input } from '@angular/core';

import { BackLink } from '../../../shared/back-link/back-link.component';

/**
 * The frame of the legal pages, open to everyone: a banner with the logo, a back arrow to the home
 * page, which the guard turns into the feed for a logged-in user, then the title and the text.
 */
@Component({
  imports: [BackLink],
  selector: 'app-legal-layout',
  styleUrl: './legal-layout.component.scss',
  templateUrl: './legal-layout.component.html',
})
export class LegalLayout {
  readonly heading = input.required<string>();
}
