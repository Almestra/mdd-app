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
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.Objects;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
class PostReadingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthCookieService authCookieService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Cookie token;

    @BeforeEach
    void logIn() {
        User user = userRepository.save(new User("arthur.dent", "arthur.dent@example.com", "hash"));
        token = new Cookie("mdd_token", authCookieService.create(user.getId()).getValue());
    }

    @Test
    void returnsAPostWrittenByAnotherUser() throws Exception {
        // Arrange: the row is written directly, with a known date stored in UTC, as the back-end stores them
        User ford = userRepository.saveAndFlush(new User("ford.prefect", "ford.prefect@example.com", "hash"));
        Long topicId = Objects.requireNonNull(jdbcTemplate.queryForObject("SELECT MIN(id) FROM topics", Long.class));
        String topicTitle = jdbcTemplate.queryForObject("SELECT title FROM topics WHERE id = ?", String.class, topicId);
        Number id = new SimpleJdbcInsert(jdbcTemplate).withTableName("posts").usingGeneratedKeyColumns("id")
                .executeAndReturnKey(
                        Map.of("title", "Don’t panic", "content", "Le Guide est plus utile qu’une serviette.",
                                "created_at", "2026-11-13 10:42:00", "author_id", ford.getId(), "topic_id", topicId));

        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}", id).cookie(token));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.longValue()))
                .andExpect(jsonPath("$.title").value("Don’t panic"))
                .andExpect(jsonPath("$.content").value("Le Guide est plus utile qu’une serviette."))
                .andExpect(jsonPath("$.createdAt").value("2026-11-13T10:42:00Z"))
                .andExpect(jsonPath("$.author").value("ford.prefect"))
                .andExpect(jsonPath("$.topic").value(topicTitle));
    }

    @Test
    void answers404WhenThePostDoesNotExist() throws Exception {
        // Act
        ResultActions response = mockMvc.perform(get("/api/posts/{id}", 0).cookie(token));

        // Assert
        response.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Cet article n’existe pas."));
    }

}
