package com.orion.mdd.post;

import com.orion.mdd.topic.Topic;
import com.orion.mdd.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * A post written by a user about a topic. Its author and its date are set when it is created, never by the user.
 */
@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    public Post(User author, Topic topic, String title, String content) {
        this.author = author;
        this.topic = topic;
        this.title = title;
        this.content = content;
        // The column keeps whole seconds: truncating here makes the API return the date it stores
        this.createdAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
    }

}
