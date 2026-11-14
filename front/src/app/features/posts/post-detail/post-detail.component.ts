import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';

import { BackLink } from '../../../shared/back-link/back-link.component';
import { PostsApi } from '../posts-api.service';

/**
 * The page of a post: its title, date, author, topic and whole content.
 */
@Component({
  imports: [BackLink, DatePipe],
  selector: 'app-post-detail',
  styleUrl: './post-detail.component.scss',
  templateUrl: './post-detail.component.html',
})
export class PostDetail {
  private readonly postsApi = inject(PostsApi);
  private readonly title = inject(Title);

  // The id in the address, /posts/:id, given by the router and turned into a number
  readonly id = input.required({ transform: numberAttribute });

  protected readonly post = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.postsApi.get(params),
  });

  // The API answers 404 when the post does not exist
  protected readonly notFound = computed(() => {
    const error = this.post.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  constructor() {
    // The tab shows the title of the post once it has loaded
    effect(() => {
      if (this.post.hasValue()) {
        this.title.setTitle(`${this.post.value().title} – MDD`);
      }
    });
  }
}
