package com.orion.mdd.post;

import com.orion.mdd.common.security.CurrentUserId;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

/**
 * Lets the logged-in users write posts and read them.
 */
@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Creates a post written by the logged-in user, in a topic they follow.
     *
     * @param userId
     *            the logged-in user
     * @param request
     *            the topic, the title and the content
     * @return the new post, with its address in the {@code Location} header
     */
    @PostMapping("/posts")
    @ApiResponse(responseCode = "201", description = "The new post",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = PostResponse.class)))
    @ApiResponse(responseCode = "400", description = "Invalid fields, or a topic the user does not follow",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "401", description = "Not logged in, or the account no longer exists",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<PostResponse> create(@CurrentUserId Long userId, @Valid @RequestBody PostRequest request) {
        PostResponse post = postService.createPost(userId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(post.id()).toUri();
        return ResponseEntity.created(location).body(post);
    }

    /**
     * Returns a post, whoever wrote it.
     *
     * @param id
     *            the post's identifier
     * @return the post
     */
    @GetMapping("/posts/{id}")
    @ApiResponse(responseCode = "200", description = "The post",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = PostResponse.class)))
    @ApiResponse(responseCode = "401", description = "Not logged in",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Post not found",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    public PostResponse get(@PathVariable Long id) {
        return postService.getPost(id);
    }

}
