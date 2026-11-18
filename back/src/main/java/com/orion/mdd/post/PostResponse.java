package com.orion.mdd.post;

import java.time.Instant;

/**
 * A post, as the API returns it. The author is named by their username only, never by their e-mail address.
 *
 * @param id
 *            the post's identifier
 * @param title
 *            the post's title
 * @param content
 *            the post's text
 * @param createdAt
 *            when the post was created, in UTC
 * @param author
 *            the username of the author
 * @param topic
 *            the title of the topic
 */
public record PostResponse(Long id, String title, String content, Instant createdAt, String author, String topic) {

    public static PostResponse from(Post post) {
        return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getCreatedAt(),
                post.getAuthor().getUsername(), post.getTopic().getTitle());
    }

}
