import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LegalLayout } from '../legal-layout/legal-layout.component';

/**
 * The privacy policy: the data MDD keeps, why and for how long, its cookies, and the rights of its
 * users.
 */
@Component({
  imports: [LegalLayout, RouterLink],
  selector: 'app-privacy-policy',
  styleUrl: './privacy-policy.component.scss',
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicy {}
