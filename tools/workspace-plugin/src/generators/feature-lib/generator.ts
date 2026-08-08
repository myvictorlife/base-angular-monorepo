import {
  formatFiles,
  generateFiles,
  names,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';

interface FeatureLibSchema {
  name: string;
  shape?: 'sync' | 'async';
}

const ESLINT_BASE = 'eslint.base.config.mjs';
const FEATURE_MARKER = '// <feature-scopes>';
const APP_MARKER = '// <demo-app-feature-scopes>';
const I18N_DIR = 'apps/demo-app/src/assets/i18n';
const LANGUAGES = ['en', 'nl', 'fr', 'pt'];

/**
 * Creates a complete feature library: the folder shape from
 * `.claude/skills/feature-lib`, the `scope:` tag registered in
 * `depConstraints`, the `@libs/*` path alias, a Vitest `test` target with the
 * coverage floor for new features, and the page's i18n keys seeded in all four
 * bundles so `i18n-completeness.spec.ts` stays green.
 *
 * The one step intentionally left manual is wiring the route into the app —
 * features compose through the app, and that composition decision is yours.
 */
export default async function featureLibGenerator(
  tree: Tree,
  options: FeatureLibSchema,
): Promise<() => void> {
  const shape = options.shape ?? 'sync';
  const feature = names(options.name);
  const projectRoot = `libs/${feature.fileName}`;
  const scope = `scope:${feature.fileName}`;
  const alias = `@libs/${feature.fileName}`;

  // ── Guards: fail loudly instead of half-writing the workspace. ────────────
  if (tree.exists(`${projectRoot}/project.json`)) {
    throw new Error(`${projectRoot} already exists.`);
  }
  const eslintBase = tree.read(ESLINT_BASE, 'utf-8');
  if (eslintBase === null) {
    throw new Error(`${ESLINT_BASE} not found — run from the workspace root.`);
  }
  if (eslintBase.includes(`'${scope}'`)) {
    throw new Error(`Tag '${scope}' is already registered in ${ESLINT_BASE}.`);
  }
  for (const marker of [FEATURE_MARKER, APP_MARKER]) {
    if (!eslintBase.includes(marker)) {
      throw new Error(
        `Marker "${marker}" is missing from ${ESLINT_BASE} — it anchors the depConstraints insertion.`,
      );
    }
  }

  const substitutions = {
    ...feature,
    scope,
    alias,
    tmpl: '',
  };

  // ── 1. Library files: shared shape + the sync/async variant. ─────────────
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'common'),
    projectRoot,
    substitutions,
  );
  generateFiles(
    tree,
    path.join(__dirname, 'files', shape),
    projectRoot,
    substitutions,
  );

  // ── 2. Path alias. ────────────────────────────────────────────────────────
  updateJson(tree, 'tsconfig.base.json', (json) => {
    json.compilerOptions.paths[alias] = [`${projectRoot}/src/index.ts`];
    return json;
  });

  // ── 3. Boundary rules: the feature's own entry + the app's allow-list. ────
  const featureEntry = [
    `  {`,
    `    sourceTag: '${scope}',`,
    `    onlyDependOnLibsWithTags: [`,
    `      'scope:entity-lib',`,
    `      'scope:environment-lib',`,
    `      'scope:theme-lib',`,
    `      'scope:translate',`,
    `      'scope:ui-lib',`,
    `    ],`,
    `  },`,
    ``,
    `  ${FEATURE_MARKER}`,
  ].join('\n');
  tree.write(
    ESLINT_BASE,
    eslintBase
      .replace(`  ${FEATURE_MARKER}`, featureEntry)
      .replace(`      ${APP_MARKER}`, `      '${scope}',\n      ${APP_MARKER}`),
  );

  // ── 4. i18n keys, identical across the four bundles. ─────────────────────
  const i18nKeys: Record<string, string> =
    shape === 'sync'
      ? { TITLE: feature.className, LEAD: `${feature.className} preferences.` }
      : {
          TITLE: feature.className,
          LEAD: `${feature.className} overview.`,
          LOADING: 'Loading…',
          ERROR: 'Something went wrong.',
        };
  for (const lang of LANGUAGES) {
    updateJson(tree, `${I18N_DIR}/${lang}.json`, (json) => {
      json[feature.constantName] = i18nKeys;
      return json;
    });
  }

  await formatFiles(tree);

  return () => {
    console.log(`\n${projectRoot} created (${shape} shape).`);
    console.log(`  ✔ '${scope}' registered in depConstraints`);
    console.log(`  ✔ '${alias}' path alias added`);
    console.log(`  ✔ test target with coverage floor 95/90/90/95`);
    console.log(`  ✔ i18n keys seeded in ${LANGUAGES.join(', ')}`);
    console.log(`\nRemaining (a composition decision, yours to make):`);
    console.log(`  add to apps/demo-app/src/app/app.routes.ts:`);
    console.log(
      `    { path: '${feature.fileName}', loadChildren: () => import('${alias}').then((m) => m.${feature.propertyName}Routes) }`,
    );
    console.log(
      `\nTranslate the seeded values in nl/fr/pt — they start as English placeholders.\n`,
    );
  };
}
