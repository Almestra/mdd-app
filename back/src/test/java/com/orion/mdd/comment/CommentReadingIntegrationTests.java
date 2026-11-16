package com.orion.mdd.comment;

import com.orion.mdd.IntegrationTest;
import com.orion.mdd.Rows;
import com.orion.mdd.common.security.AuthCookieService;
import com.orion.mdd.user.User;
import com.orion.mdd.user.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Objects;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
class CommentReadingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthCookieService authCookieService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User arthur;

    private User ford;

    private Cookie token;

    private Long postId;

    @BeforeEach
    void logInAndFindAPost() {
        arthur = userRepository.saveAndFlush(new User("arthur.dent", "arthur.dent@example.com", "hash"));
        ford = userRepository.saveAndFlush(new User("ford.prefect", "ford.prefect@example.com", "hash"));
        token = new Cookie("mdd_token", authCookieService.create(arthur.getId()).getValue());
        Long topicId = Objects.requireNonNull(jdbcTemplate.queryForObject("SELECT MIN(id) FROM topics", Long.class));
        postId = Rows.insertPost(jdbcTemplate, ford.getId(), topicId, "Don’t panic",
                "Le Guide est plus utile qu’une serviette.", "2026-11-13 10:00:00");
    }

    @Test
    void listsTheCommentsOfThePostOldestFirst() throws Exception {
        // Arrange
        Rows.insertComment(jdbcTemplate, arthur.getId(), postId, "Newer", "2026-11-13 11:00:00");
        Rows.insertComment(jdbcTemplate, ford.getId(), postId, "Older", "2026-11-13 10:42:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}/comments", postId).cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].content", contains("Older", "Newer")))
                .andExpect(jsonPath("$[*].author", contains("ford.prefect", "arthur.dent")))
                .andExpect(jsonPath("$[0].createdAt").value("2026-11-13T10:42:00Z"));
    }

    @Test
    void putsTheFirstCreatedFirstWhenTwoCommentsShareTheSameSecond() throws Exception {
        // Arrange
        Rows.insertComment(jdbcTemplate, ford.getId(), postId, "First", "2026-11-13 10:42:00");
        Rows.insertComment(jdbcTemplate, ford.getId(), postId, "Second", "2026-11-13 10:42:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}/comments", postId).cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].content", contains("First", "Second")));
    }

    @Test
    void leavesOutTheCommentsOfOtherPosts() throws Exception {
        // Arrange
        Long topicId = Objects.requireNonNull(jdbcTemplate.queryForObject("SELECT MIN(id) FROM topics", Long.class));
        Long otherPostId = Rows.insertPost(jdbcTemplate, ford.getId(), topicId, "Mostly harmless", "42",
                "2026-11-13 10:00:00");
        Rows.insertComment(jdbcTemplate, ford.getId(), postId, "Here", "2026-11-13 10:42:00");
        Rows.insertComment(jdbcTemplate, ford.getId(), otherPostId, "Elsewhere", "2026-11-13 10:42:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}/comments", postId).cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].content", contains("Here")));
    }

    @Test
    void answers404WhenThePostDoesNotExist() throws Exception {
        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}/comments", 0).cookie(token));

        // Assert
        response.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Cet article n’existe pas."));
    }

}
