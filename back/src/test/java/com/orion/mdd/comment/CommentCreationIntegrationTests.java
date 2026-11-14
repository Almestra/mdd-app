package com.orion.mdd.comment;

import com.jayway.jsonpath.JsonPath;
import com.orion.mdd.Csrf;
import com.orion.mdd.IntegrationTest;
import com.orion.mdd.common.security.AuthCookieService;
import com.orion.mdd.user.User;
import com.orion.mdd.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
class CommentCreationIntegrationTests {

    // A date in UTC to the second, like 2026-11-13T10:42:00Z: the database keeps no fraction of a second
    private static final String UTC_TO_THE_SECOND = "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthCookieService authCookieService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private User user;

    private Cookie token;

    private Long postId;

    // The post is written by another user, in a topic the logged-in user does not follow: anyone can comment
    @BeforeEach
    void logInAndFindAPost() {
        user = userRepository.save(new User("arthur.dent", "arthur.dent@example.com", "hash"));
        token = new Cookie("mdd_token", authCookieService.create(user.getId()).getValue());
        User ford = userRepository.saveAndFlush(new User("ford.prefect", "ford.prefect@example.com", "hash"));
        Long topicId = Objects.requireNonNull(jdbcTemplate.queryForObject("SELECT MIN(id) FROM topics", Long.class));
        postId = new SimpleJdbcInsert(jdbcTemplate).withTableName("posts").usingGeneratedKeyColumns("id")
                .executeAndReturnKey(
                        Map.of("title", "Don’t panic", "content", "Le Guide est plus utile qu’une serviette.",
                                "created_at", "2026-11-13 10:42:00", "author_id", ford.getId(), "topic_id", topicId))
                .longValue();
    }

    @Test
    void createsTheCommentWithTheLoggedInUserAsAuthor() throws Exception {
        // Act
        ResultActions response = comment(postId, "Et n’oubliez pas votre serviette.");

        // Assert
        response.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.content").value("Et n’oubliez pas votre serviette."))
                .andExpect(jsonPath("$.author").value("arthur.dent"))
                .andExpect(jsonPath("$.createdAt", matchesPattern(UTC_TO_THE_SECOND)));
        Long id = readId(response);
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT author_id, post_id FROM comments WHERE id = ?", id))
                .isEqualTo(Map.of("author_id", user.getId(), "post_id", postId));
    }

    @Test
    void answers404WhenThePostDoesNotExist() throws Exception {
        // Act
        ResultActions response = comment(0L, "Et n’oubliez pas votre serviette.");

        // Assert
        response.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Cet article n’existe pas."));
    }

    @Test
    void refusesAnInvalidComment() throws Exception {
        // Act
        ResultActions response = comment(postId, " ");

        // Assert
        response.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.content").value("Le commentaire est obligatoire."));
    }

    private ResultActions comment(Long post, String content) throws Exception {
        return mockMvc.perform(post("/api/posts/{id}/comments", post).cookie(token).with(Csrf.from(mockMvc))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"content": "%s"}
                        """.formatted(content)));
    }

    private static Long readId(ResultActions response) throws Exception {
        String json = response.andReturn().getResponse().getContentAsString();
        return JsonPath.parse(json).read("$.id", Long.class);
    }

}
