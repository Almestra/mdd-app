package com.orion.mdd.post;

import com.orion.mdd.common.validation.RequiredTopic;
import com.orion.mdd.common.validation.ValidPostContent;
import com.orion.mdd.common.validation.ValidPostTitle;

/**
 * The data sent to create a post. The author and the date are not part of it: the back-end sets them.
 *
 * @param topicId
 *            the topic, among those the user follows
 * @param title
 *            the title
 * @param content
 *            the plain text of the post
 */
public record PostRequest(@RequiredTopic Long topicId, @ValidPostTitle String title,
        @ValidPostContent String content) {

}
