import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp } from '../../../../testing/app-testing';
import { User } from '../../../core/session/user.model';

describe('Privacy policy page', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };

  it.each<[string, User | null]>([
    ['a visitor', null],
    ['a logged-in user', user],
  ])('opens for %s, with the contact address and a link to the profile', async (_, who) => {
    // Act
    const { page } = await openApp('/privacy-policy', who);

    // Assert
    expect(TestBed.inject(Router).url).toBe('/privacy-policy');
    expect(page.querySelector('h1')?.textContent).toContain('Politique de confidentialité');
    expect(page.querySelector('a[href="mailto:contact@orion.example"]')).not.toBeNull();
    // Where users correct their data and delete their account
    expect(page.querySelector('a[href="/profile"]')).not.toBeNull();
  });
});
