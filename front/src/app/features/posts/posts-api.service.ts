import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from './post.model';
import { PostRequest } from './post-request.model';

/** The order of the feed: the newest posts first (desc) or the oldest first (asc). */
export type FeedDirection = 'desc' | 'asc';

@Injectable({ providedIn: 'root' })
export class PostsApi {
  private readonly http = inject(HttpClient);

  /**
   * Lists the posts of the topics the user follows, sorted by date.
   */
  feed(direction: FeedDirection): Observable<Post[]> {
    return this.http.get<Post[]>('/api/feed', { params: { direction } });
  }

  /**
   * Reads a post.
   */
  get(id: number): Observable<Post> {
    return this.http.get<Post>(`/api/posts/${id}`);
  }

  /**
   * Creates a post in a topic the user follows.
   */
  create(request: PostRequest): Observable<Post> {
    return this.http.post<Post>('/api/posts', request);
  }
}
