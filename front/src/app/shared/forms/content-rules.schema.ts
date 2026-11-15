import { maxLength, required, schema } from '@angular/forms/signals';

/**
 * The topic of a post, which must be chosen.
 */
export const requiredTopicRules = schema<number | null>((path) => {
  required(path, { message: 'Le thème est obligatoire.' });
});

/**
 * The title of a post: 100 characters at most, as the API requires.
 */
export const postTitleRules = schema<string>((path) => {
  required(path, { message: 'Le titre est obligatoire.' });
  maxLength(path, 100, { message: 'Le titre compte 100 caractères au plus.' });
});

/**
 * The text of a post: 10,000 characters at most, as the API requires.
 */
export const postContentRules = schema<string>((path) => {
  required(path, { message: 'Le contenu est obligatoire.' });
  maxLength(path, 10_000, { message: 'Le contenu compte 10 000 caractères au plus.' });
});
