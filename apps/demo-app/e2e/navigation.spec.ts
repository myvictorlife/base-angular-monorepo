import { expect, test } from '@playwright/test';

/**
 * Routing, lazy loading and the 404 fallback.
 *
 * These are the parts a unit test can only assert trivially: `pages.routes.ts`
 * declares a `loadChildren`, and whether that chunk actually resolves depends on
 * the build, not on the declaration.
 */
test.describe('navigation', () => {
  test('renders the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test('lazy-loads the profile feature', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/profile$/);
    // Either the loaded profile or its error state — the API is not running in CI.
    // Both prove the lazy chunk resolved and the route's providers were created.
    await expect(page.locator('lib-profile')).toBeVisible();
  });

  test('lazy-loads the settings feature', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('lib-settings')).toBeVisible();
    await expect(page.getByRole('radiogroup')).toHaveCount(2);
  });

  test('renders the design system page', async ({ page }) => {
    await page.goto('/design');

    await expect(page.locator('h1')).toBeVisible();
  });

  test('falls back to the not-found page for an unknown route', async ({
    page,
  }) => {
    await page.goto('/this-route-does-not-exist');

    // A hosting rewrite that is misconfigured returns the raw 404 of the host
    // instead of the app — which is exactly what this catches on a deployed run.
    await expect(page.locator('app-root')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('sets a translated document title per route', async ({ page }) => {
    await page.goto('/');
    const home = await page.title();

    await page.goto('/settings');
    const settings = await page.title();

    expect(home).not.toBe(settings);
    // An untranslated title leaks the i18n key itself.
    expect(settings).not.toMatch(/^[A-Z_.]+$/);
  });
});
