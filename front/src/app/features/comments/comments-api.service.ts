import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Comment } from './comment.model';
import { CommentRequest } from './comment-request.model';

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private readonly http = inject(HttpClient);

  /**
   * Lists the comments of a post, oldest first.
   */
  list(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/posts/${postId}/comments`);
  }

  /**
   * Comments a post in the name of the logged-in user.
   */
  create(postId: number, request: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`/api/posts/${postId}/comments`, request);
  }
}
