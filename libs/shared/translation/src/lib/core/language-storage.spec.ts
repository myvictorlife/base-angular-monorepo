import { Language } from '@libs/entity';
import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  readStoredLanguage,
} from './language-storage';

describe('language-storage', () => {
  beforeEach(() => localStorage.clear());

  describe('isSupportedLanguage', () => {
    it.each(Object.values(Language))('accepts %s', (lang) => {
      expect(isSupportedLanguage(lang)).toBe(true);
    });

    it('rejects unknown codes, null and empty string', () => {
      expect(isSupportedLanguage('ja')).toBe(false);
      expect(isSupportedLanguage(null)).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('readStoredLanguage', () => {
    it('returns English when nothing is stored', () => {
      expect(readStoredLanguage()).toBe(Language.English);
    });

    it('returns the stored language when it is supported', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, Language.French);

      expect(readStoredLanguage()).toBe(Language.French);
    });

    it('falls back to English for a language that is no longer supported', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'klingon');

      expect(readStoredLanguage()).toBe(Language.English);
    });
  });
});
