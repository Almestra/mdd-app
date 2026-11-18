package com.orion.mdd.common.web;

import org.jspecify.annotations.NullMarked;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Reads a sort direction from a request parameter, whatever its case, so that the API accepts {@code asc} and
 * {@code desc}. Spring's own conversion only accepts {@code ASC} and {@code DESC}. An unknown value gives a 400.
 */
@NullMarked
@Component
public class SortDirectionConverter implements Converter<String, Sort.Direction> {

    @Override
    public Sort.Direction convert(String source) {
        return Sort.Direction.fromString(source);
    }

}
