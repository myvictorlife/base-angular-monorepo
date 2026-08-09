import { Language } from './language.enum';

export interface LanguageMetadata {
  /**
   * The language's name in itself (endonym) — deliberately NOT translated.
   * A picker that names each language in the viewer's current language is
   * unreadable to the person who needs it most: someone who cannot read the
   * current language. Endonyms also remove the N×N matrix of translated
   * language names from the i18n bundles.
   */
  label: string;
  /** Direction `<html dir>` must switch to while this language is active. */
  dir: 'ltr' | 'rtl';
}

/**
 * The single source of truth for language display data. Everything that lists
 * or reacts to languages (header select, settings, document direction) derives
 * from this record plus the enum — adding a language is one enum line, one
 * entry here and one translation bundle. `i18n-completeness.spec.ts` fails if
 * an enum value has no entry.
 */
export const LANGUAGE_METADATA: Record<Language, LanguageMetadata> = {
  [Language.English]: { label: 'English', dir: 'ltr' },
  [Language.Dutch]: { label: 'Nederlands', dir: 'ltr' },
  [Language.French]: { label: 'Français', dir: 'ltr' },
  [Language.Portuguese]: { label: 'Português', dir: 'ltr' },
  [Language.Spanish]: { label: 'Español', dir: 'ltr' },
  [Language.German]: { label: 'Deutsch', dir: 'ltr' },
  [Language.Arabic]: { label: 'العربية', dir: 'rtl' },
  [Language.Polish]: { label: 'Polski', dir: 'ltr' },
};
