import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp, OpenedApp } from '../../../testing/app-testing';
import { User } from '../../core/session/user.model';
import { Post } from '../posts/post.model';

describe('Feed page', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };
  const newer: Post = {
    id: 2,
    title: 'Mostly harmless',
    content: 'The Guide sums up the Earth in two words.',
    createdAt: '2026-11-13T11:00:00Z',
    author: 'ford.prefect',
    topic: 'Towels',
  };
  const older: Post = {
    id: 1,
    title: 'Don’t panic',
    content: 'Written in large friendly letters on the cover.',
    createdAt: '2026-11-12T10:00:00Z',
    author: 'arthur.dent',
    topic: 'Babel fish',
  };

  function titles(page: HTMLElement): string[] {
    return [...page.querySelectorAll('app-post-card h2')].map((title) =>
      (title.textContent ?? '').trim(),
    );
  }

  function sortButton(page: HTMLElement): HTMLButtonElement {
    return page.querySelector('button.sort') as HTMLButtonElement;
  }

  async function openFeed(answer: Post[]): Promise<OpenedApp> {
    const opened = await openApp('/feed', user);
    opened.http.expectOne('/api/feed?direction=desc').flush(answer);
    await opened.fixture.whenStable();
    return opened;
  }

  it('opens from the header, whose link then marks the current page', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/topics', user);
    http.expectOne('/api/topics').flush([]);
    const link = page.querySelector('header nav a[href="/feed"]') as HTMLAnchorElement;
    expect(link.getAttribute('aria-current')).toBeNull();

    // Act: once open, the page asks for the feed
    link.click();
    const request = await vi.waitFor(() => http.expectOne('/api/feed?direction=desc'));
    request.flush([newer, older]);
    await fixture.whenStable();

    // Assert
    expect(TestBed.inject(Router).url).toBe('/feed');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('shows the posts in the order of the API, each with its date, author and content', async () => {
    // Act
    const { page } = await openFeed([newer, older]);

    // Assert
    expect(titles(page)).toEqual(['Mostly harmless', 'Don’t panic']);
    const card = page.querySelector('app-post-card') as HTMLElement;
    expect(card.textContent).toContain('13/11/2026');
    expect(card.textContent).toContain('ford.prefect');
    expect(card.textContent).toContain('The Guide sums up the Earth in two words.');
  });

  it('asks for the oldest posts first, then the newest again, as the user reverses the order', async () => {
    // Arrange
    const { fixture, http, page } = await openFeed([newer, older]);

    // Act
    sortButton(page).click();
    TestBed.tick();
    http.expectOne('/api/feed?direction=asc').flush([older, newer]);
    await fixture.whenStable();
    const oldestFirst = titles(page);
    sortButton(page).click();
    TestBed.tick();
    http.expectOne('/api/feed?direction=desc').flush([newer, older]);
    await fixture.whenStable();

    // Assert
    expect(oldestFirst).toEqual(['Don’t panic', 'Mostly harmless']);
    expect(titles(page)).toEqual(['Mostly harmless', 'Don’t panic']);
  });

  it('tells screen readers which order is shown', async () => {
    // Arrange
    const { fixture, http, page } = await openFeed([newer, older]);
    const newestFirst = sortButton(page).textContent;

    // Act
    sortButton(page).click();
    TestBed.tick();
    http.expectOne('/api/feed?direction=asc').flush([older, newer]);
    await fixture.whenStable();

    // Assert
    expect(newestFirst).toContain('du plus récent au plus ancien');
    expect(sortButton(page).textContent).toContain('du plus ancien au plus récent');
  });

  it('says so when the feed is empty', async () => {
    // Act
    const { page } = await openFeed([]);

    // Assert
    expect(page.querySelector('.empty')?.textContent).toContain('Aucun article');
    expect(titles(page)).toHaveLength(0);
  });

  it('says so when the feed cannot be loaded', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/feed', user);

    // Act
    http
      .expectOne('/api/feed?direction=desc')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    // Assert
    expect(page.querySelector('[role="alert"]')?.textContent?.trim()).toBeTruthy();
    expect(titles(page)).toHaveLength(0);
  });
});
