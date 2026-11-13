package com.orion.mdd.post;

import com.orion.mdd.IntegrationTest;
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

import java.util.List;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
class FeedIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthCookieService authCookieService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User ford;

    private Cookie token;

    private Long followed;

    private Long notFollowed;

    @BeforeEach
    void logIn() {
        User arthur = userRepository.saveAndFlush(new User("arthur.dent", "arthur.dent@example.com", "hash"));
        ford = userRepository.saveAndFlush(new User("ford.prefect", "ford.prefect@example.com", "hash"));
        token = new Cookie("mdd_token", authCookieService.create(arthur.getId()).getValue());
        List<Long> topics = jdbcTemplate.queryForList("SELECT id FROM topics ORDER BY id LIMIT 2", Long.class);
        followed = topics.get(0);
        notFollowed = topics.get(1);
        jdbcTemplate.update("INSERT INTO subscriptions (user_id, topic_id) VALUES (?, ?)", arthur.getId(), followed);
    }

    @Test
    void showsThePostsOfTheFollowedTopicsNewestFirst() throws Exception {
        // Arrange
        write("Older", followed, "2026-11-13 10:00:00");
        write("Newer", followed, "2026-11-13 11:00:00");
        write("Elsewhere", notFollowed, "2026-11-13 12:00:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/feed").cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", contains("Newer", "Older")))
                .andExpect(jsonPath("$[0].author").value("ford.prefect"));
    }

    @Test
    void showsTheOldestFirstOnDemand() throws Exception {
        // Arrange
        write("Newer", followed, "2026-11-13 11:00:00");
        write("Older", followed, "2026-11-13 10:00:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/feed").param("direction", "asc").cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", contains("Older", "Newer")));
    }

    @Test
    void putsTheLastCreatedFirstWhenTwoPostsShareTheSameSecond() throws Exception {
        // Arrange: dates are stored to the second, so two posts can have the same one
        write("First", followed, "2026-11-13 10:00:00");
        write("Second", followed, "2026-11-13 10:00:00");

        // Act
        ResultActions response = mockMvc.perform(get("/api/feed").cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", contains("Second", "First")));
    }

    @Test
    void refusesAnUnknownDirection() throws Exception {
        // Act
        ResultActions response = mockMvc.perform(get("/api/feed").param("direction", "sideways").cookie(token));

        // Assert
        response.andExpect(status().isBadRequest());
    }

    private void write(String title, Long topicId, String createdAt) {
        jdbcTemplate.update(
                "INSERT INTO posts (title, content, created_at, author_id, topic_id) VALUES (?, ?, ?, ?, ?)",
                title, "42", createdAt, ford.getId(), topicId);
    }

}
