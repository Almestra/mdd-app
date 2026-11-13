package com.orion.mdd.post;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
class PostCreationIntegrationTests {

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

    private Long topicId;

    @BeforeEach
    void logIn() {
        user = userRepository.save(new User("arthur.dent", "arthur.dent@example.com", "hash"));
        token = new Cookie("mdd_token", authCookieService.create(user.getId()).getValue());
        topicId = Objects.requireNonNull(jdbcTemplate.queryForObject("SELECT MIN(id) FROM topics", Long.class));
    }

    @Test
    void createsThePostWithTheLoggedInUserAsAuthor() throws Exception {
        // Arrange
        follow(topicId);
        String topicTitle = jdbcTemplate.queryForObject("SELECT title FROM topics WHERE id = ?", String.class, topicId);

        // Act
        ResultActions response = create(topicId, "Don’t panic", "Le Guide est plus utile qu’une serviette.");

        // Assert
        response.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Don’t panic"))
                .andExpect(jsonPath("$.content").value("Le Guide est plus utile qu’une serviette."))
                .andExpect(jsonPath("$.author").value("arthur.dent"))
                .andExpect(jsonPath("$.topic").value(topicTitle))
                .andExpect(jsonPath("$.createdAt", matchesPattern(UTC_TO_THE_SECOND)));
        Long id = readId(response);
        response.andExpect(header().string("Location", endsWith("/api/posts/" + id)));
        entityManager.flush();
        assertThat(jdbcTemplate.queryForMap("SELECT author_id, topic_id FROM posts WHERE id = ?", id))
                .isEqualTo(Map.of("author_id", user.getId(), "topic_id", topicId));
    }

    @Test
    void refusesATopicTheUserDoesNotFollow() throws Exception {
        // Act
        ResultActions response = create(topicId, "Don’t panic", "Le Guide est plus utile qu’une serviette.");

        // Assert
        response.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.topicId").value("Choisissez un thème auquel vous êtes abonné."));
    }

    @Test
    void refusesMissingFields() throws Exception {
        // Act
        ResultActions response = mockMvc.perform(post("/api/posts").cookie(token).with(Csrf.from(mockMvc))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"title": " ", "content": " "}
                        """));

        // Assert
        response.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.topicId").value("Le thème est obligatoire."))
                .andExpect(jsonPath("$.errors.title").value("Le titre est obligatoire."))
                .andExpect(jsonPath("$.errors.content").value("Le contenu est obligatoire."));
    }

    @Test
    void refusesATitleOrAContentThatIsTooLong() throws Exception {
        // Arrange
        follow(topicId);

        // Act
        ResultActions response = create(topicId, "4".repeat(101), "2".repeat(10_001));

        // Assert
        response.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").value("100 caractères au plus."))
                .andExpect(jsonPath("$.errors.content").value("10 000 caractères au plus."));
    }

    // The row is written directly, so that these tests depend on no other feature. Hibernate still holds the user
    // saved above, without this row, so it must forget it, as a new request would
    private void follow(Long id) {
        jdbcTemplate.update("INSERT INTO subscriptions (user_id, topic_id) VALUES (?, ?)", user.getId(), id);
        entityManager.clear();
    }

    private ResultActions create(Long topic, String title, String content) throws Exception {
        return mockMvc.perform(post("/api/posts").cookie(token).with(Csrf.from(mockMvc))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"topicId": %d, "title": "%s", "content": "%s"}
                        """.formatted(topic, title, content)));
    }

    private static Long readId(ResultActions response) throws Exception {
        String json = response.andReturn().getResponse().getContentAsString();
        return JsonPath.parse(json).read("$.id", Long.class);
    }

}
