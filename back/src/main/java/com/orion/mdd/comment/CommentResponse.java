package com.orion.mdd.comment;

import java.time.Instant;

/**
 * A comment, as the API returns it. The author is named by their username only, never by their e-mail address.
 *
 * @param id
 *            the comment's identifier
 * @param content
 *            the comment's text
 * @param createdAt
 *            when the comment was created, in UTC
 * @param author
 *            the username of the author
 */
public record CommentResponse(Long id, String content, Instant createdAt, String author) {

    public static CommentResponse from(Comment comment) {
        return new CommentResponse(comment.getId(), comment.getContent(), comment.getCreatedAt(),
                comment.getAuthor().getUsername());
    }

}
