package com.orion.mdd.post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Finds a post with its author and its topic, loaded by the same query.
     *
     * @param id
     *            the post's identifier
     * @return the post, or nothing if it does not exist
     */
    @Query("""
            SELECT p
            FROM Post p
            JOIN FETCH p.author
            JOIN FETCH p.topic
            WHERE p.id = :id
            """)
    Optional<Post> findWithAuthorAndTopicById(Long id);

}
