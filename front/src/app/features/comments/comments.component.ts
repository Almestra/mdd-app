import { Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { apply, form, FormField, FormRoot } from '@angular/forms/signals';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';

import { commentContentRules } from '../../shared/forms/content-rules.schema';
import { submissionErrors } from '../../shared/forms/server-errors.util';
import { CommentRequest } from './comment-request.model';
import { CommentsApi } from './comments-api.service';

const EMPTY: CommentRequest = { content: '' };

/**
 * The Comments section of a post: its comments, oldest first, each with its author, then the field
 * to add one.
 */
@Component({
  imports: [FormField, FormRoot, MatError, MatFormField, MatIconButton, MatInput],
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

  private readonly draft = signal<CommentRequest>(EMPTY);
  protected readonly failure = signal('');

  // The rules of the API, checked before sending
  protected readonly commentForm = form(
    this.draft,
    (path) => {
      apply(path.content, commentContentRules);
    },
    {
      submission: {
        action: async (field) => {
          try {
            const comment = await firstValueFrom(
              this.commentsApi.create(this.postId(), this.draft()),
            );
            // A list that failed to load cannot take the new comment: it loads again instead
            if (this.comments.hasValue()) {
              this.comments.update((comments) => [...(comments ?? []), comment]);
            } else {
              this.comments.reload();
            }
            field().reset(EMPTY);
            this.failure.set('');

            return undefined;
          } catch (error) {
            return submissionErrors(error, field, this.failure);
          }
        },
      },
    },
  );
}
