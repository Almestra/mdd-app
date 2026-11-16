import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp, OpenedApp } from '../testing/app-testing';
import { Session } from './core/session/session.service';
import { User } from './core/session/user.model';

describe('App', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };

  it('shows the home page to a visitor on the root URL', async () => {
    // Act
    const { fixture } = await openApp('/', null);

    // Assert
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('img')?.alt).toBe('MDD');
    expect(page.querySelector('a[href="/login"]')?.textContent).toContain('Se connecter');
    expect(page.querySelector('a[href="/register"]')?.textContent).toContain('S’inscrire');
  });

  it.each(['/', '/login', '/register'])(
    'sends a logged-in user from %s to the feed',
    async (url) => {
      // Act
      await openApp(url, user);

      // Assert
      expect(TestBed.inject(Router).url).toBe('/feed');
    },
  );

  it('logs the user out from the header and goes back home', async () => {
    // Arrange
    const { fixture } = await openApp('/feed', user);
    const page = fixture.nativeElement as HTMLElement;
    const logOut = [...page.querySelectorAll('header button')].find((button) =>
      button.textContent?.includes('Se déconnecter'),
    ) as HTMLButtonElement;

    // Act
    logOut.click();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/auth/logout');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    // Assert
    expect(request.request.method).toBe('POST');
    expect(TestBed.inject(Session).user()).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  describe('side menu', () => {
    // Material opens it at the end of the page, outside the banner
    function sideMenu(): HTMLElement | null {
      return document.querySelector('mat-dialog-container');
    }

    // Opens the menu of the banner on the post creation page, which none of its links leads to,
    // once the page has loaded the topics
    async function openMenu(): Promise<OpenedApp> {
      const opened = await openApp('/posts/new', user);
      opened.http.expectOne('/api/topics').flush([]);
      const menuButton = opened.page.querySelector(
        'header button[aria-label="Ouvrir le menu"]',
      ) as HTMLButtonElement;
      menuButton.click();
      await opened.fixture.whenStable();
      return opened;
    }

    it('shows the links of the banner', async () => {
      // Act
      await openMenu();

      // Assert
      const menu = sideMenu();
      expect(menu?.querySelector('button')?.textContent).toContain('Se déconnecter');
      expect(menu?.querySelector('a[href="/feed"]')?.textContent).toContain('Articles');
      expect(menu?.querySelector('a[href="/topics"]')?.textContent).toContain('Thèmes');
      expect(menu?.querySelector('a[href="/profile"]')?.getAttribute('aria-label')).toBe('Profil');
    });

    it.each([
      ['/feed', '/api/feed?direction=desc'],
      ['/topics', '/api/topics'],
      ['/profile', '/api/topics'],
    ])('opens %s, then closes', async (url, dataRequest) => {
      // Arrange
      const { fixture, http } = await openMenu();
      const link = sideMenu()?.querySelector(`a[href="${url}"]`) as HTMLAnchorElement;

      // Act: once open, the page asks for its data
      link.click();
      const request = await vi.waitFor(() => http.expectOne(dataRequest));
      request.flush([]);
      await fixture.whenStable();

      // Assert
      expect(TestBed.inject(Router).url).toBe(url);
      expect(sideMenu()).toBeNull();
    });

    it('logs the user out, then closes', async () => {
      // Arrange
      const { fixture, http } = await openMenu();
      const logOut = sideMenu()?.querySelector('button') as HTMLButtonElement;

      // Act
      logOut.click();
      http.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
      await fixture.whenStable();

      // Assert
      expect(TestBed.inject(Session).user()).toBeNull();
      expect(TestBed.inject(Router).url).toBe('/');
      expect(sideMenu()).toBeNull();
    });
  });

  it('sends a visitor from the feed to the login page', async () => {
    // Act
    await openApp('/feed', null);

    // Assert
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it.each<[string, User | null]>([
    ['/', null],
    ['/login', null],
    ['/legal-notice', null],
    ['/feed', user],
  ])('links the legal pages from the footer of %s', async (url, who) => {
    // Act
    const { page } = await openApp(url, who);

    // Assert
    const footer = page.querySelector('footer');
    expect(footer?.querySelector('a[href="/legal-notice"]')?.textContent).toContain(
      'Mentions légales',
    );
    expect(footer?.querySelector('a[href="/privacy-policy"]')?.textContent).toContain(
      'Politique de confidentialité',
    );
  });

  it('marks the legal page the user is on in the footer', async () => {
    // Act
    const { page } = await openApp('/privacy-policy', null);

    // Assert
    const footer = page.querySelector('footer');
    expect(footer?.querySelector('a[href="/privacy-policy"]')?.getAttribute('aria-current')).toBe(
      'page',
    );
    expect(
      footer?.querySelector('a[href="/legal-notice"]')?.getAttribute('aria-current'),
    ).toBeNull();
  });
});
