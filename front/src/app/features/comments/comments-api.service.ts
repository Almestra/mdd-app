import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Comment } from './comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private readonly http = inject(HttpClient);

  /**
   * Lists the comments of a post, oldest first.
   */
  list(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/posts/${postId}/comments`);
  }
}
