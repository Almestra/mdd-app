import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp } from '../../../../testing/app-testing';
import { User } from '../../../core/session/user.model';

describe('Legal notice page', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };

  it.each<[string, User | null]>([
    ['a visitor', null],
    ['a logged-in user', user],
  ])('opens for %s, with the contact address and a way back', async (_, who) => {
    // Act
    const { page } = await openApp('/legal-notice', who);

    // Assert
    expect(TestBed.inject(Router).url).toBe('/legal-notice');
    expect(page.querySelector('h1')?.textContent).toContain('Mentions légales');
    expect(page.querySelector('a[href="mailto:contact@orion.example"]')).not.toBeNull();
    const back = page.querySelector('a[aria-label="Retour à l’accueil"]');
    expect(back?.getAttribute('href')).toBe('/');
  });
});
