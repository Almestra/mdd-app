package com.orion.mdd.comment;

import com.orion.mdd.common.validation.ValidCommentContent;

/**
 * The data sent to comment a post. The author, the date and the post are not part of it: the back-end sets them.
 *
 * @param content
 *            the plain text of the comment
 */
public record CommentRequest(@ValidCommentContent String content) {

}
