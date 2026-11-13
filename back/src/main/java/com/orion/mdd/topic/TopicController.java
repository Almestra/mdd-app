package com.orion.mdd.topic;

import com.orion.mdd.common.security.CurrentUserId;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes the topics to the logged-in users, who can subscribe to them and unsubscribe from them.
 */
@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    /**
     * Lists every topic, sorted by title, and says which ones the logged-in user follows.
     *
     * @param userId
     *            the logged-in user
     * @return the topics
     */
    @GetMapping
    @ApiResponse(responseCode = "200", description = "Every topic, sorted by title, with the user's subscriptions",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                    array = @ArraySchema(schema = @Schema(implementation = TopicResponse.class))))
    @ApiResponse(responseCode = "401", description = "Not logged in, or the account no longer exists",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    public List<TopicResponse> list(@CurrentUserId Long userId) {
        return topicService.listTopics(userId);
    }

    /**
     * Subscribes the logged-in user to a topic. Subscribing again changes nothing.
     *
     * @param userId
     *            the logged-in user
     * @param id
     *            the topic's identifier
     * @return an empty response
     */
    @PutMapping("/{id}/subscription")
    @ApiResponse(responseCode = "204", description = "Subscribed, even if the user already was")
    @ApiResponse(responseCode = "401", description = "Not logged in, or the account no longer exists",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Topic not found",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<Void> subscribe(@CurrentUserId Long userId, @PathVariable Long id) {
        topicService.subscribe(userId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Unsubscribes the logged-in user from a topic. Nothing changes if the user did not follow it.
     *
     * @param userId
     *            the logged-in user
     * @param id
     *            the topic's identifier
     * @return an empty response
     */
    @DeleteMapping("/{id}/subscription")
    @ApiResponse(responseCode = "204", description = "Unsubscribed, even if the user did not follow the topic")
    @ApiResponse(responseCode = "401", description = "Not logged in, or the account no longer exists",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Topic not found",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                    schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<Void> unsubscribe(@CurrentUserId Long userId, @PathVariable Long id) {
        topicService.unsubscribe(userId, id);
        return ResponseEntity.noContent().build();
    }

}
