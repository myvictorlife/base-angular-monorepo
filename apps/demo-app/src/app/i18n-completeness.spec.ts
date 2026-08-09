import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { LANGUAGE_METADATA, Language } from '@libs/entity';

// Resolved from the workspace root (where Vitest runs): the unit-test builder
// executes specs from a bundled location, so `__dirname` no longer points at src.
const I18N_DIR = join(process.cwd(), 'apps/demo-app/src/assets/i18n');

type Json = { [key: string]: string | Json };

const flatten = (obj: Json, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const load = (lang: string): Json =>
  JSON.parse(readFileSync(join(I18N_DIR, `${lang}.json`), 'utf8'));

const SUPPORTED = Object.values(Language);
const keysByLang = new Map(
  SUPPORTED.map((lang) => [lang, flatten(load(lang))]),
);
const reference = keysByLang.get(Language.English) as string[];

describe('i18n completeness', () => {
  it('ships a bundle for every language in the enum', () => {
    const onDisk = readdirSync(I18N_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort();

    expect(onDisk).toEqual([...SUPPORTED].sort());
  });

  it.each(SUPPORTED)('%s has no missing keys', (lang) => {
    const keys = keysByLang.get(lang) as string[];

    expect(reference.filter((k) => !keys.includes(k))).toEqual([]);
  });

  it.each(SUPPORTED)('%s has no extra keys', (lang) => {
    const keys = keysByLang.get(lang) as string[];

    expect(keys.filter((k) => !reference.includes(k))).toEqual([]);
  });

  it.each(SUPPORTED)('%s has no empty values', (lang) => {
    const flat = (obj: Json, prefix = ''): [string, string][] =>
      Object.entries(obj).flatMap(([key, value]) =>
        typeof value === 'object' && value !== null
          ? flat(value, `${prefix}${key}.`)
          : ([[`${prefix}${key}`, value as string]] as [string, string][]),
      );

    const blank = flat(load(lang)).filter(([, value]) => value.trim() === '');

    expect(blank).toEqual([]);
  });

  it('has metadata (endonym + direction) for every language in the enum', () => {
    // Language names are endonyms from LANGUAGE_METADATA, not i18n keys — a
    // picker must stay readable to someone who cannot read the active language.
    for (const lang of SUPPORTED) {
      const metadata = LANGUAGE_METADATA[lang];
      expect(metadata).toBeDefined();
      expect(metadata.label.trim()).not.toBe('');
      expect(['ltr', 'rtl']).toContain(metadata.dir);
    }
  });
});
