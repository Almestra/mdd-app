CREATE TABLE users
(
    id       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30)  NOT NULL UNIQUE,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE topics
(
    id          BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(50) NOT NULL UNIQUE,
    description TEXT        NOT NULL
);

CREATE TABLE posts
(
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(100) NOT NULL,
    content    TEXT         NOT NULL,
    created_at DATETIME     NOT NULL,
    author_id  BIGINT       NOT NULL,
    topic_id   BIGINT       NOT NULL,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_topic FOREIGN KEY (topic_id) REFERENCES topics (id)
);

CREATE TABLE comments
(
    id         BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    content    TEXT     NOT NULL,
    created_at DATETIME NOT NULL,
    author_id  BIGINT   NOT NULL,
    post_id    BIGINT   NOT NULL,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE TABLE subscriptions
(
    user_id  BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, topic_id),
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_topic FOREIGN KEY (topic_id) REFERENCES topics (id)
);
