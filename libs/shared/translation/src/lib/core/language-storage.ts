import { Language } from '@libs/entity';

/** localStorage key holding the user's language choice across sessions. */
export const LANGUAGE_STORAGE_KEY = 'language';

const SUPPORTED_LANGUAGES = Object.values(Language) as readonly string[];

export function isSupportedLanguage(value: string | null): value is Language {
  return value !== null && SUPPORTED_LANGUAGES.includes(value);
}

/**
 * Language to boot with. Read once at bootstrap and handed to
 * `provideTranslateService({ lang })`, so an unknown or absent value falls back
 * to English instead of leaving the app with no active language.
 */
export function readStoredLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(saved) ? saved : Language.English;
}
