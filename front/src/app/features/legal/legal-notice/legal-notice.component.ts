import { Component } from '@angular/core';

import { LegalLayout } from '../legal-layout/legal-layout.component';

/**
 * The legal notice: who publishes MDD, who hosts it, and how to contact them.
 */
@Component({
  imports: [LegalLayout],
  selector: 'app-legal-notice',
  styleUrl: './legal-notice.component.scss',
  templateUrl: './legal-notice.component.html',
})
export class LegalNotice {}
