import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { apply, form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BackLink } from '../../../shared/back-link/back-link.component';
import {
  postContentRules,
  postTitleRules,
  requiredTopicRules,
} from '../../../shared/forms/content-rules.schema';
import { submissionErrors } from '../../../shared/forms/server-errors.util';
import { TopicsApi } from '../../topics/topics-api.service';
import { PostRequest } from '../post-request.model';
import { PostsApi } from '../posts-api.service';

/**
 * The creation of a post, in one of the topics the user follows.
 */
@Component({
  imports: [
    BackLink,
    FormField,
    FormRoot,
    MatButton,
    MatError,
    MatFormField,
    MatInput,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  selector: 'app-post-create',
  styleUrl: './post-create.component.scss',
  templateUrl: './post-create.component.html',
})
export class PostCreate {
  private readonly postsApi = inject(PostsApi);
  private readonly topicsApi = inject(TopicsApi);
  private readonly router = inject(Router);

  protected readonly topics = rxResource({ stream: () => this.topicsApi.list() });

  // The API accepts a post only in a topic the user follows
  protected readonly followedTopics = computed(() =>
    this.topics.hasValue() ? this.topics.value().filter((topic) => topic.subscribed) : [],
  );

  private readonly draft = signal<PostRequest>({ topicId: null, title: '', content: '' });
  protected readonly failure = signal('');

  // The rules of the API, checked before sending
  protected readonly postForm = form(
    this.draft,
    (path) => {
      apply(path.topicId, requiredTopicRules);
      apply(path.title, postTitleRules);
      apply(path.content, postContentRules);
    },
    {
      submission: {
        action: async (field) => {
          try {
            const post = await firstValueFrom(this.postsApi.create(this.draft()));
            await this.router.navigateByUrl(`/posts/${post.id}`);
            return undefined;
          } catch (error) {
            return submissionErrors(error, field, this.failure);
          }
        },
      },
    },
  );
}
