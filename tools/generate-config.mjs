#!/usr/bin/env node
/**
 * Turns the JSON files in `config/` into typed TypeScript modules under
 * `libs/environment/src/lib/generated/`.
 *
 *   config/firebase.json  ──▶  libs/environment/src/lib/generated/firebase.config.ts
 *
 * Neither side is tracked by git: `config/*.json` holds credentials, and the generated
 * modules are derived from them. Only the `*.example.json` files are committed, which is
 * what keeps this template free of anyone's real project.
 *
 * ## Why generate
 *
 * Angular has no `.env` support. `fileReplacements` swaps whole files and `define` only
 * accepts values hardcoded in `project.json`, so a developer would otherwise paste
 * credentials into three tracked environment files.
 *
 * ## Adding another integration
 *
 * Everything vendor-specific lives in the `CONFIGS` array below. To add one:
 *
 *   1. declare its interface in `libs/environment/src/lib/environment.model.ts`
 *   2. append an entry here
 *   3. commit a `config/<name>.example.json` showing the shape
 *
 * Nothing else changes: the loop at the bottom writes the module, and `environment*.ts`
 * imports what it needs from `./generated/`.
 *
 * ## Input format
 *
 * The files are JSON, so you paste only the object a console hands you. A raw copy out
 * of the Firebase Console is JavaScript rather than JSON — unquoted keys, single quotes,
 * trailing commas, comments, a leading `const firebaseConfig =` — and the reader below
 * normalises all of it, so pasting works before reformatting does.
 *
 * Individual values can also come from the environment (`FIREBASE_API_KEY`, ...), which
 * is how CI supplies credentials with nothing on disk. Those win over the file.
 *
 * A missing file is not an error: the config comes out empty and its `*Enabled` flag is
 * `false`, so a fresh clone builds and runs with the integration simply off.
 *
 * Run by `postinstall` and by the app's Nx build/serve/test targets (`targetDefaults` ->
 * `environment:generate-config` in `nx.json`). Writes only when the content changes, so
 * it neither busts the Nx cache nor retriggers the dev-server watcher.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = join(workspaceRoot, '.env');
const GENERATED_DIR = 'libs/environment/src/lib/generated';

/**
 * One entry per integration. `keys` doubles as the shape of the generated object and as
 * the order it is written in, so it has to match the interface named by `typeName`.
 */
const CONFIGS = [
  {
    name: 'firebase',
    source: 'config/firebase.json',
    output: `${GENERATED_DIR}/firebase.config.ts`,
    typeName: 'FirebaseConfig',
    exportName: 'firebaseConfig',
    flagName: 'firebaseEnabled',
    envPrefix: 'FIREBASE',
    keys: [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
      'measurementId',
    ],
    /** Anything less and the SDK cannot initialise, so the flag stays `false`. */
    required: ['apiKey', 'projectId', 'appId'],
    /** Both follow from the project id, so a partial paste still yields a usable config. */
    derive(config) {
      if (!config.projectId) return;
      config.authDomain ||= `${config.projectId}.firebaseapp.com`;
      config.storageBucket ||= `${config.projectId}.firebasestorage.app`;
    },
  },
  {
    // Links back to this deployment's own repository ("view source on GitHub").
    // Not a credential, but it is project identity, and identity follows the same
    // rule as credentials here: never committed, so a fork's build never points at
    // someone else's repo. CI supplies SITE_REPO_URL from `github.repository`,
    // which makes the link self-correcting per fork.
    name: 'site',
    source: 'config/site.json',
    output: `${GENERATED_DIR}/site.config.ts`,
    typeName: 'SiteConfig',
    exportName: 'siteConfig',
    flagName: 'siteLinksEnabled',
    envPrefix: 'SITE',
    keys: ['repoUrl'],
    required: ['repoUrl'],
  },
];

// --- reading -----------------------------------------------------------------

/**
 * Minimal `.env` reader — dependency-free so the template installs nothing extra.
 * Handles `export ` prefixes, `#` comments, blank lines, quoted values and CRLF.
 * Values here are scalars; objects belong in `config/*.json`.
 */
function readEnvFile(path) {
  if (!existsSync(path)) return {};

  const result = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line
      .slice(0, separator)
      .replace(/^export\s+/, '')
      .trim();
    let value = line.slice(separator + 1).trim();

    const quoted =
      value.length > 1 && (value.startsWith('"') || value.startsWith("'"));
    if (quoted && value.endsWith(value[0])) {
      value = value.slice(1, -1);
    } else {
      // Only strip trailing comments on unquoted values, where `#` cannot be data.
      value = value.split(' #')[0].trim();
    }

    result[key] = value;
  }
  return result;
}

/**
 * Parses an object that may be JSON or the JavaScript a console shows. The source is
 * normalised into JSON and parsed — never eval'd, so a config file cannot execute code
 * during a build.
 */
function parseObject(raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  const json = raw
    .slice(start, end + 1)
    // `[^:]` guards `https://` inside values such as databaseURL.
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(
      /'((?:[^'\\]|\\.)*)'/g,
      (_, inner) => `"${inner.replace(/"/g, '\\"')}"`,
    )
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1');

  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/** `apiKey` + `FIREBASE` -> `FIREBASE_API_KEY`. */
const envVarFor = (prefix, key) =>
  `${prefix}_${key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()}`;

function resolve(entry, env) {
  const path = join(workspaceRoot, entry.source);
  const raw = existsSync(path) ? readFileSync(path, 'utf8').trim() : '';
  const parsed = raw ? parseObject(raw) : null;

  if (raw && !parsed) {
    console.warn(
      `[config] ${entry.source} is not a readable object — ignoring it. Paste the object ` +
        'exactly as the console shows it, braces included.',
    );
  }

  const config = {};
  for (const key of entry.keys) {
    const fromEnv = env[envVarFor(entry.envPrefix, key)];
    const fromFile = parsed?.[key];
    const value = fromEnv ?? (typeof fromFile === 'string' ? fromFile : '');
    config[key] = String(value).trim();
  }

  entry.derive?.(config);

  return {
    config,
    hasSource: Boolean(raw),
    enabled: entry.required.every((key) => config[key]),
  };
}

// --- writing -----------------------------------------------------------------

/** Single-quoted to match the workspace Prettier style. */
const quote = (value) =>
  `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const exampleOf = (source) => source.replace(/\.json$/, '.example.json');

function buildModule(entry, config, enabled) {
  const entries = entry.keys
    .map((key) => `  ${key}: ${quote(config[key])},`)
    .join('\n');

  return `/**
 * GENERATED FILE — DO NOT EDIT, YOUR CHANGES WILL BE OVERWRITTEN.
 *
 * Written by \`tools/generate-config.mjs\` from \`${entry.source}\` (start from
 * \`${exampleOf(entry.source)}\`). Git-ignored: this is where your own
 * credentials live, and they stay out of every commit.
 *
 * Regenerate with \`npm run config:generate\` — or just \`npm start\`, which does it for
 * you, as does any Nx build/serve/test of the app.
 */
import { ${entry.typeName} } from '../environment.model';

export const ${entry.exportName}: ${entry.typeName} = {
${entries}
};

/**
 * \`true\` only when ${entry.required.join(', ')} are all present. Everything keys off
 * this flag, so an absent config degrades to "the integration is simply off" instead of
 * an SDK that fails at runtime on empty values.
 *
 * Left unannotated on purpose — \`: boolean\` on a literal trips
 * \`@typescript-eslint/no-inferrable-types\`, and \`Environment\` types the field anyway.
 */
export const ${entry.flagName} = ${enabled};
`;
}

/** Skipping identical writes keeps the Nx cache and the dev-server watcher quiet. */
function writeIfChanged(path, contents) {
  if (existsSync(path) && readFileSync(path, 'utf8') === contents) return false;

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  return true;
}

/**
 * Firebase-specific tail: the CLI needs its own file, and the project it deploys to is
 * the one already sitting in the config — so there is nothing extra to fill in.
 *
 * The `storybook` hosting target only exists when `FIREBASE_STORYBOOK_SITE` is set —
 * the design-system site is opt-in, and deploys use `--only hosting:<target>` so an
 * unmapped target is never resolved.
 */
function writeFirebaseRc(config, env) {
  const dir = join(workspaceRoot, 'hosting');
  if (!existsSync(dir)) return;

  const placeholder = 'YOUR_FIREBASE_PROJECT_ID';
  const project = config.projectId || placeholder;
  const site = env.FIREBASE_HOSTING_SITE || config.projectId || placeholder;
  const storybookSite = env.FIREBASE_STORYBOOK_SITE;

  const hosting = { app: [site] };
  if (storybookSite) hosting.storybook = [storybookSite];

  writeIfChanged(
    join(dir, '.firebaserc'),
    `${JSON.stringify(
      {
        projects: { default: project },
        targets: { [project]: { hosting } },
      },
      null,
      2,
    )}\n`,
  );
}

// --- run ---------------------------------------------------------------------

// `process.env` last so CI secrets override a stale local file.
const env = { ...readEnvFile(ENV_FILE), ...process.env };

for (const entry of CONFIGS) {
  const { config, enabled, hasSource } = resolve(entry, env);

  writeIfChanged(
    join(workspaceRoot, entry.output),
    buildModule(entry, config, enabled),
  );

  if (entry.name === 'firebase') writeFirebaseRc(config, env);

  if (enabled) {
    console.log(
      `[config] ${entry.name}: enabled — ${config.projectId || 'configured'}`,
    );
  } else if (hasSource) {
    console.log(
      `[config] ${entry.name}: ${entry.source} found, but ${entry.required.join(', ')} ` +
        'are incomplete — disabled.',
    );
  } else {
    console.log(
      `[config] ${entry.name}: no ${entry.source} — disabled. ` +
        `Copy ${exampleOf(entry.source)} to enable it.`,
    );
  }
}
