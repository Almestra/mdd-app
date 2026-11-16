package com.orion.mdd.comment;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Finds the comments of a post with their authors, loaded by the same query.
     *
     * @param postId
     *            the commented post
     * @param sort
     *            the order of the comments
     * @return the comments of the post
     */
    @Query("""
            SELECT c
            FROM Comment c
            JOIN FETCH c.author
            WHERE c.post.id = :postId
            """)
    List<Comment> findWithAuthorByPostId(Long postId, Sort sort);
}
