package com.orion.mdd.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The title of a post: 100 characters at most. Each broken rule reports its own message.
 */
@NotBlank(message = "Le titre est obligatoire.")
@Size(max = 100, message = "Le titre compte 100 caractères au plus.")
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ValidPostTitle {

    String message() default "Ce titre n’est pas valide.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
