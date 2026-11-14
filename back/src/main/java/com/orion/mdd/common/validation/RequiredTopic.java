package com.orion.mdd.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotNull;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The topic of a post, which must be given.
 */
@NotNull(message = "Le thème est obligatoire.")
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiredTopic {

    String message() default "Le thème est obligatoire.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
