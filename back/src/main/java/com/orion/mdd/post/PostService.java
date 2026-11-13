package com.orion.mdd.post;

import com.orion.mdd.common.exception.InvalidFieldException;
import com.orion.mdd.common.exception.UserNotFoundException;
import com.orion.mdd.topic.Topic;
import com.orion.mdd.user.User;
import com.orion.mdd.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the posts.
 */
@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    public PostService(PostRepository postRepository, UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
    }

    /**
     * Creates a post in a topic the user follows, so that the post shows up in the author's own feed. The
     * logged-in user is its author, and the post takes the current date.
     *
     * @param userId
     *            the identifier carried by the token
     * @param request
     *            the topic, the title and the content
     * @return the saved post
     * @throws UserNotFoundException
     *             if the account no longer exists
     * @throws InvalidFieldException
     *             if the user does not follow the topic, or if the topic does not exist
     */
    @Transactional
    public PostResponse createPost(Long userId, PostRequest request) {
        User author = userService.getCurrentUser(userId);
        Topic topic = author.findSubscription(request.topicId())
                .orElseThrow(
                        () -> new InvalidFieldException("topicId", "Choisissez un thème auquel vous êtes abonné."));
        return PostResponse.from(postRepository.save(new Post(author, topic, request.title(), request.content())));
    }

}
