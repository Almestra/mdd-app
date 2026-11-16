import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { apply, form, Schema } from '@angular/forms/signals';

import { commentContentRules, postContentRules, postTitleRules } from './content-rules.schema';

/**
 * Applies the rules to a value, in a one-field form, and returns the kinds of the broken rules.
 */
function brokenRules(rules: Schema<string>, value: string): string[] {
  return TestBed.runInInjectionContext(() => {
    const field = form(signal(value), (path) => apply(path, rules));
    return field()
      .errors()
      .map((error) => error.kind);
  });
}

describe('Content rules', () => {
  it.each([
    [postTitleRules, '', ['required']],
    [postTitleRules, '4'.repeat(101), ['maxLength']],
    [postContentRules, '', ['required']],
    [postContentRules, '4'.repeat(10_001), ['maxLength']],
    [commentContentRules, '', ['required']],
    [commentContentRules, '4'.repeat(2_001), ['maxLength']],
  ])('refuses an invalid value (%#)', (rules, value, broken) => {
    expect(brokenRules(rules, value)).toEqual(broken);
  });

  it.each([
    [postTitleRules, '42'],
    [postTitleRules, '4'.repeat(100)],
    [postContentRules, '42'],
    [postContentRules, '4'.repeat(10_000)],
    [commentContentRules, '42'],
    [commentContentRules, '4'.repeat(2_000)],
  ])('accepts a valid value even at the limits (%#)', (rules, value) => {
    expect(brokenRules(rules, value)).toEqual([]);
  });
});
