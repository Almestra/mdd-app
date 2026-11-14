package com.orion.mdd.comment;

import com.orion.mdd.common.exception.PostNotFoundException;
import com.orion.mdd.common.exception.UserNotFoundException;
import com.orion.mdd.post.Post;
import com.orion.mdd.post.PostService;
import com.orion.mdd.user.User;
import com.orion.mdd.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adds the comments under the posts.
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserService userService;
    private final PostService postService;

    public CommentService(CommentRepository commentRepository, UserService userService, PostService postService) {
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.postService = postService;
    }

    /**
     * Comments a post. Any logged-in user can, since every post is open to everyone. The logged-in user is the
     * author, and the comment takes the current date.
     *
     * @param userId
     *            the identifier carried by the token
     * @param postId
     *            the post to comment
     * @param request
     *            the content
     * @return the saved comment
     * @throws UserNotFoundException
     *             if the account no longer exists
     * @throws PostNotFoundException
     *             if the post does not exist
     */
    @Transactional
    public CommentResponse createComment(Long userId, Long postId, CommentRequest request) {
        User author = userService.getCurrentUser(userId);
        Post post = postService.findPost(postId);
        return CommentResponse.from(commentRepository.save(new Comment(author, post, request.content())));
    }

}
