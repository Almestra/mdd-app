import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { fieldError, openApp, OpenedApp, submit, type } from '../../../../testing/app-testing';
import { User } from '../../../core/session/user.model';
import { Topic } from '../../topics/topic.model';
import { Post } from '../post.model';

describe('Post creation page', () => {
  const user: User = { id: 42, username: 'arthur.dent', email: 'arthur.dent@example.com' };
  const towels: Topic = {
    id: 1,
    title: 'Towels',
    description: 'The most useful thing a hitchhiker can carry.',
    subscribed: true,
  };
  const babelFish: Topic = {
    id: 2,
    title: 'Babel fish',
    description: 'Translates any language.',
    subscribed: false,
  };
  const vogonPoetry: Topic = {
    id: 3,
    title: 'Vogon poetry',
    description: 'The third worst in the universe.',
    subscribed: true,
  };
  const created: Post = {
    id: 7,
    title: 'Don’t panic',
    content: 'Written in large friendly letters on the cover.',
    createdAt: '2026-11-14T10:00:00Z',
    author: 'arthur.dent',
    topic: 'Towels',
  };

  async function openForm(topics = [towels, babelFish, vogonPoetry]): Promise<OpenedApp> {
    const opened = await openApp('/posts/new', user);
    opened.http.expectOne('/api/topics').flush(topics);
    await opened.fixture.whenStable();
    return opened;
  }

  // Opens the list of topics and gives its options
  async function topicOptions({ fixture, page }: OpenedApp): Promise<HTMLElement[]> {
    (page.querySelector('#topic .mat-mdc-select-trigger') as HTMLElement).click();
    await fixture.whenStable();
    return [...document.querySelectorAll<HTMLElement>('mat-option')];
  }

  async function fillIn(opened: OpenedApp): Promise<void> {
    const options = await topicOptions(opened);
    options.find((option) => option.textContent?.includes(towels.title))?.click();
    type(opened.page, 'title', created.title);
    type(opened.page, 'content', created.content);
    await opened.fixture.whenStable();
  }

  it('opens from the create button of the feed', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/feed', user);
    http.expectOne('/api/feed?direction=desc').flush([]);
    await fixture.whenStable();

    // Act: once open, the page asks for the topics
    (page.querySelector('a[href="/posts/new"]') as HTMLAnchorElement).click();
    const request = await vi.waitFor(() => http.expectOne('/api/topics'));
    request.flush([towels]);
    await fixture.whenStable();

    // Assert
    expect(TestBed.inject(Router).url).toBe('/posts/new');
    expect(page.querySelector('h1')?.textContent).toContain('Créer un nouvel article');
  });

  it('offers only the topics the user follows', async () => {
    // Arrange
    const opened = await openForm();

    // Act
    const options = await topicOptions(opened);

    // Assert
    expect(options.map((option) => option.textContent?.trim())).toEqual(['Towels', 'Vogon poetry']);
  });

  it('creates the post, then opens its page', async () => {
    // Arrange
    const opened = await openForm();
    await fillIn(opened);

    // Act
    submit(opened.page);
    const request = opened.http.expectOne('/api/posts');
    request.flush(created, { status: 201, statusText: 'Created' });
    // The page of the post opens and asks for it
    const post = await vi.waitFor(() => opened.http.expectOne('/api/posts/7'));
    post.flush(created);
    await opened.fixture.whenStable();

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      topicId: 1,
      title: created.title,
      content: created.content,
    });
    expect(TestBed.inject(Router).url).toBe('/posts/7');
  });

  it('sends nothing while a field is empty', async () => {
    // Arrange
    const { fixture, http, page } = await openForm();

    // Act
    submit(page);
    await fixture.whenStable();

    // Assert
    http.expectNone('/api/posts');
    expect(fieldError(page, 'topic')?.textContent).toContain('Le thème est obligatoire.');
    expect(fieldError(page, 'title')?.textContent).toContain('Le titre est obligatoire.');
    expect(fieldError(page, 'content')?.textContent).toContain('Le contenu est obligatoire.');
  });

  it('keeps the title and the content within the limits of the API', async () => {
    // Arrange
    const opened = await openForm();
    await fillIn(opened);
    type(opened.page, 'title', 'a'.repeat(101));
    type(opened.page, 'content', 'a'.repeat(10_001));

    // Act
    submit(opened.page);
    await opened.fixture.whenStable();

    // Assert
    opened.http.expectNone('/api/posts');
    expect(fieldError(opened.page, 'title')?.textContent).toContain('100 caractères au plus.');
    expect(fieldError(opened.page, 'content')?.textContent).toContain('10 000 caractères au plus.');
  });

  it('shows under its field the error the API gives', async () => {
    // Arrange
    const opened = await openForm();
    await fillIn(opened);

    // Act
    submit(opened.page);
    opened.http
      .expectOne('/api/posts')
      .flush(
        { errors: { topicId: 'Choisissez un thème auquel vous êtes abonné.' } },
        { status: 400, statusText: 'Bad Request' },
      );
    await opened.fixture.whenStable();

    // Assert
    expect(fieldError(opened.page, 'topic')?.textContent).toContain(
      'Choisissez un thème auquel vous êtes abonné.',
    );
    expect(TestBed.inject(Router).url).toBe('/posts/new');
  });

  it('says so when the post cannot be created', async () => {
    // Arrange
    const opened = await openForm();
    await fillIn(opened);

    // Act
    submit(opened.page);
    opened.http
      .expectOne('/api/posts')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await opened.fixture.whenStable();

    // Assert
    expect(opened.page.querySelector('[role="alert"]')?.textContent).toContain(
      'Une erreur est survenue. Veuillez réessayer.',
    );
  });

  it('points to the topics page when the user follows no topic', async () => {
    // Act
    const { page } = await openForm([babelFish]);

    // Assert
    const hint = page.querySelector('.hint');
    expect(hint?.textContent).toContain('abonnez-vous');
    expect(hint?.querySelector('a')?.getAttribute('href')).toBe('/topics');
  });

  it('says so when the topics cannot be loaded', async () => {
    // Arrange
    const { fixture, http, page } = await openApp('/posts/new', user);

    // Act
    http.expectOne('/api/topics').flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    // Assert
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Les thèmes n’ont pas pu être chargés.',
    );
  });
});
