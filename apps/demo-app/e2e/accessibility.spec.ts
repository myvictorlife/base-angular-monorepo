import { expect, test } from '@playwright/test';

/**
 * Structural accessibility checks, kept deliberately dependency-free.
 *
 * This is not an axe-core audit — it is the handful of things that break silently
 * during ordinary work: a heading that disappears, a control that loses its
 * accessible name, a language switch that does not update `<html lang>`.
 */
const ROUTES = ['/', '/settings', '/design', '/profile'];

test.describe('accessibility', () => {
  for (const route of ROUTES) {
    test(`${route} has exactly one h1 and a landmark structure`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator('app-root')).toBeVisible();

      await expect(page.locator('h1')).toHaveCount(1);
      // getByRole('banner'), not locator('header'): a <header> nested inside
      // <main> is a legitimate sectioning header, not a landmark. Matching the
      // tag would fail any page that titles itself with one.
      await expect(page.getByRole('banner')).toBeVisible();
    });

    test(`${route} declares its language on <html>`, async ({ page }) => {
      await page.goto(route);

      // Screen readers pick pronunciation from this. It is set by
      // `document-language.ts` and is easy to break by reordering providers.
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        /^(en|nl|fr|pt)$/,
      );
    });
  }

  test('every interactive control in the header has an accessible name', async ({
    page,
  }) => {
    await page.goto('/');

    // The header hides controls per breakpoint, so only the visible ones are in
    // scope. `filter({ visible: true })` does that in the locator rather than
    // with an `if` inside the loop, which keeps the test branch-free.
    const controls = page
      .locator('header button, header a')
      .filter({ visible: true });
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);

      const name = (
        (await control.getAttribute('aria-label')) ??
        (await control.textContent()) ??
        ''
      ).trim();

      expect(
        name,
        `control #${i} in the header has no accessible name`,
      ).not.toBe('');
    }
  });

  test('the theme toggle reports its state', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('lib-theme-toggle button');
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
  });
});
