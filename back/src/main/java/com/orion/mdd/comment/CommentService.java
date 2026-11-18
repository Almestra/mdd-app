package com.orion.mdd.comment;

import com.orion.mdd.common.exception.PostNotFoundException;
import com.orion.mdd.common.exception.UserNotFoundException;
import com.orion.mdd.post.Post;
import com.orion.mdd.post.PostService;
import com.orion.mdd.user.User;
import com.orion.mdd.user.UserService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Adds the comments under the posts and lists them.
 */
@Service
public class CommentService {

    // The comments created in the same second keep the order in which they were created
    private static final Sort OLDEST_FIRST = Sort.by("createdAt", "id");

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

    /**
     * Lists the comments of a post, oldest first, so that they read as a conversation. Any logged-in user can read
     * them, like the post.
     *
     * @param postId
     *            the commented post
     * @return the comments, possibly none
     * @throws PostNotFoundException
     *             if the post does not exist
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long postId) {
        postService.findPost(postId);

        return commentRepository.findWithAuthorByPostId(postId, OLDEST_FIRST).stream()
                .map(CommentResponse::from)
                .toList();
    }

}
