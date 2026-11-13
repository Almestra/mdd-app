import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { Post } from '../../posts/post.model';

/**
 * A post of the feed: its title, its date and author, and the start of its content.
 */
@Component({
  imports: [DatePipe],
  selector: 'app-post-card',
  styleUrl: './post-card.component.scss',
  templateUrl: './post-card.component.html',
})
export class PostCard {
  readonly post = input.required<Post>();
}
