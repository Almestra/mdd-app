package com.orion.mdd;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;

import java.util.Map;

/**
 * Writes rows directly in the database, so that a test depends on no other feature and can choose the dates. Dates
 * are written as the back-end stores them, in UTC, such as {@code 2026-11-13 10:42:00}.
 */
public final class Rows {

    private Rows() {
    }

    /**
     * Writes a post.
     *
     * @param jdbcTemplate
     *            the access to the test database
     * @param authorId
     *            the author
     * @param topicId
     *            the topic
     * @param title
     *            the title
     * @param content
     *            the text
     * @param createdAt
     *            the date, in UTC
     * @return the identifier of the new post
     */
    public static Long insertPost(JdbcTemplate jdbcTemplate, Long authorId, Long topicId, String title,
            String content, String createdAt) {
        return new SimpleJdbcInsert(jdbcTemplate).withTableName("posts").usingGeneratedKeyColumns("id")
                .executeAndReturnKey(Map.of("title", title, "content", content, "created_at", createdAt,
                        "author_id", authorId, "topic_id", topicId))
                .longValue();
    }

}
