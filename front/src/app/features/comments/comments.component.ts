import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { CommentsApi } from './comments-api.service';

/**
 * The Comments section of a post: its comments, oldest first, each with its author.
 */
@Component({
  selector: 'app-comments',
  styleUrl: './comments.component.scss',
  templateUrl: './comments.component.html',
})
export class Comments {
  private readonly commentsApi = inject(CommentsApi);

  readonly postId = input.required<number>();

  protected readonly comments = rxResource({
    params: () => this.postId(),
    stream: ({ params }) => this.commentsApi.list(params),
  });
}
