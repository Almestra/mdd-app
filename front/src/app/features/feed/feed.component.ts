import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';

import { FeedDirection, PostsApi } from '../posts/posts-api.service';
import { PostCard } from './post-card/post-card.component';

/**
 * The feed: the posts of the topics the user follows, newest first, in an order the user can
 * reverse.
 */
@Component({
  imports: [MatButton, PostCard],
  selector: 'app-feed',
  styleUrl: './feed.component.scss',
  templateUrl: './feed.component.html',
})
export class Feed {
  private readonly postsApi = inject(PostsApi);

  protected readonly direction = signal<FeedDirection>('desc');

  // Loaded when the page opens, then again each time the order changes
  protected readonly posts = rxResource({
    params: () => this.direction(),
    stream: ({ params }) => this.postsApi.feed(params),
  });

  protected reverse(): void {
    this.direction.update((direction) => (direction === 'desc' ? 'asc' : 'desc'));
  }
}
