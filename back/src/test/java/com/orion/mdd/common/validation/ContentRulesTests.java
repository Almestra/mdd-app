package com.orion.mdd.common.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Checks the rules of what users write once, without Spring or a database. The features only check that they apply
 * them.
 */
class ContentRulesTests {

    private static final ValidatorFactory FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = FACTORY.getValidator();

    /** Carries the rules as the request records do. */
    private record Writing(@ValidCommentContent String comment) {
    }

    @AfterAll
    static void closeTheFactory() {
        FACTORY.close();
    }

    @ParameterizedTest
    @MethodSource("invalidValues")
    void refusesAnInvalidValueWithTheRuleItBreaks(String field, String value, Set<String> brokenRules) {
        // Act
        Set<ConstraintViolation<Writing>> violations = VALIDATOR.validateValue(Writing.class, field, value);

        // Assert: the name of each broken rule, such as NotBlank or Size
        assertThat(violations.stream()
                .map(violation -> violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName())
                .collect(Collectors.toSet())).isEqualTo(brokenRules);
    }

    private static Stream<Arguments> invalidValues() {
        return Stream.of(
                Arguments.of("comment", "   ", Set.of("NotBlank")),
                Arguments.of("comment", "4".repeat(2_001), Set.of("Size")));
    }

    @ParameterizedTest
    @MethodSource("validValues")
    void acceptsAValidValueEvenAtTheLimits(String field, String value) {
        // Act
        Set<ConstraintViolation<Writing>> violations = VALIDATOR.validateValue(Writing.class, field, value);

        // Assert
        assertThat(violations).isEmpty();
    }

    private static Stream<Arguments> validValues() {
        return Stream.of(
                Arguments.of("comment", "42"),
                Arguments.of("comment", "4".repeat(2_000)));
    }

    @Test
    void refusesAMissingValue() {
        // Act
        Set<ConstraintViolation<Writing>> violations = VALIDATOR.validate(new Writing(null));

        // Assert: one message per field, so that each one shows under its own field
        assertThat(violations).extracting(violation -> violation.getPropertyPath().toString())
                .containsExactlyInAnyOrder("comment");
    }

}
