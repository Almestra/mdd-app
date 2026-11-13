import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp, OpenedApp } from '../../../../testing/app-testing';
import { User } from '../../../core/session/user.model';
import { Post } from '../post.model';

describe('Post page', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };
  const post: Post = {
    id: 2,
    title: 'Mostly harmless',
    content: 'The Guide sums up the Earth in two words.\nThe next edition says a little more.',
    createdAt: '2026-11-13T11:00:00Z',
    author: 'ford.prefect',
    topic: 'Towels',
  };

  async function openPost(): Promise<OpenedApp> {
    const opened = await openApp('/posts/2', user);
    opened.http.expectOne('/api/posts/2').flush(post);
    await opened.fixture.whenStable();
    return opened;
  }

  it('opens from its card in the feed', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/feed', user);
    http.expectOne('/api/feed?direction=desc').flush([post]);
    await fixture.whenStable();

    // Act: once open, the page asks for the post
    (page.querySelector('app-post-card h2 a') as HTMLAnchorElement).click();
    const request = await vi.waitFor(() => http.expectOne('/api/posts/2'));
    request.flush(post);
    await fixture.whenStable();

    // Assert
    expect(TestBed.inject(Router).url).toBe('/posts/2');
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Mostly harmless');
  });

  it('shows the date, author, topic and whole content of the post', async () => {
    // Act
    const { page } = await openPost();

    // Assert
    const article = page.querySelector('article')?.textContent ?? '';
    expect(article).toContain('13/11/2026');
    expect(article).toContain('ford.prefect');
    expect(article).toContain('Towels');
    expect(article).toContain(post.content);
  });

  it('shows the title of the post in the browser tab', async () => {
    // Act
    await openPost();

    // Assert
    expect(document.title).toBe('Mostly harmless – MDD');
  });

  it('goes back to the feed with the back arrow', async () => {
    // Arrange
    const { fixture, http, page } = await openPost();

    // Act
    (page.querySelector('a.back') as HTMLAnchorElement).click();
    const request = await vi.waitFor(() => http.expectOne('/api/feed?direction=desc'));
    request.flush([]);
    await fixture.whenStable();

    // Assert
    expect(TestBed.inject(Router).url).toBe('/feed');
  });

  it('says so when the post does not exist', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/posts/2', user);

    // Act
    http.expectOne('/api/posts/2').flush({ status: 404 }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    // Assert
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Cet article n’existe pas.',
    );
  });

  it('says so when the post cannot be loaded', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/posts/2', user);

    // Act
    http
      .expectOne('/api/posts/2')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    // Assert
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'L’article n’a pas pu être chargé.',
    );
  });
});
