import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { openApp, OpenedApp } from '../../../../testing/app-testing';
import { User } from '../../../core/session/user.model';
import { Comment } from '../../comments/comment.model';
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

  const comments: Comment[] = [
    { id: 7, content: 'Don’t panic.', createdAt: '2026-11-13T11:30:00Z', author: 'arthur.dent' },
    { id: 8, content: 'Share and enjoy.', createdAt: '2026-11-13T12:00:00Z', author: 'marvin' },
  ];

  // Opens the post, then answers the request for its comments, which the page sends once the post
  // has loaded
  async function openPost(withComments: Comment[] = comments): Promise<OpenedApp> {
    const opened = await openApp('/posts/2', user);
    opened.http.expectOne('/api/posts/2').flush(post);
    const request = await vi.waitFor(() => opened.http.expectOne('/api/posts/2/comments'));
    request.flush(withComments);
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
    (await vi.waitFor(() => http.expectOne('/api/posts/2/comments'))).flush([]);
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
    (page.querySelector('.back a') as HTMLAnchorElement).click();
    const request = await vi.waitFor(() => http.expectOne('/api/feed?direction=desc'));
    request.flush([]);
    await fixture.whenStable();

    // Assert
    expect(TestBed.inject(Router).url).toBe('/feed');
  });

  it('shows the comments of the post, each with its author', async () => {
    // Act
    const { page } = await openPost();

    // Assert
    const items = [...page.querySelectorAll('app-comments li')].map((item) => item.textContent);
    expect(items).toHaveLength(2);
    expect(items[0]).toContain('arthur.dent');
    expect(items[0]).toContain('Don’t panic.');
    expect(items[1]).toContain('marvin');
    expect(items[1]).toContain('Share and enjoy.');
  });

  it('says so when the post has no comment yet', async () => {
    // Act
    const { page } = await openPost([]);

    // Assert
    expect(page.querySelector('app-comments')?.textContent).toContain(
      'Aucun commentaire pour l’instant.',
    );
  });

  it('says so when the comments cannot be loaded', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/posts/2', user);
    http.expectOne('/api/posts/2').flush(post);

    // Act
    const request = await vi.waitFor(() => http.expectOne('/api/posts/2/comments'));
    request.flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    // Assert
    expect(page.querySelector('app-comments [role="alert"]')?.textContent).toContain(
      'Les commentaires n’ont pas pu être chargés.',
    );
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
