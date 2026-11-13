package com.orion.mdd.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * The data sent to create a post. The author and the date are not part of it: the back-end sets them.
 *
 * @param topicId
 *            the topic, among those the user follows
 * @param title
 *            the title, 100 characters at most
 * @param content
 *            the plain text of the post, 10,000 characters at most
 */
public record PostRequest(
        @NotNull(message = "Le thème est obligatoire.") Long topicId,
        @NotBlank(message = "Le titre est obligatoire.") @Size(max = 100,
                message = "100 caractères au plus.") String title,
        @NotBlank(message = "Le contenu est obligatoire.") @Size(max = 10_000,
                message = "10 000 caractères au plus.") String content) {

}
