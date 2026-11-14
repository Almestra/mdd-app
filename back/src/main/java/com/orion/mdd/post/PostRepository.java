package com.orion.mdd.post;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
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

    /**
     * Finds the posts of the topics a user follows, with their authors and topics, loaded by the same query.
     *
     * @param userId
     *            the user whose feed it is
     * @param sort
     *            the order of the posts
     * @return the posts of the user's feed
     */
    @Query("""
            SELECT p
            FROM Post p
            JOIN FETCH p.author
            JOIN FETCH p.topic
            WHERE p.topic IN (
                SELECT t
                FROM User u
                JOIN u.subscriptions t
                WHERE u.id = :userId
            )
            """)
    List<Post> findFeed(Long userId, Sort sort);
}
