import { test, expect } from '@playwright/test';

test('selecting a flight shows details panel', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  // Wait for map root to load
  await expect(page.getByTestId('map-root')).toBeVisible();

  // Click deterministic test selector (enabled in e2e mode)
  await page.getByTestId('e2e-select').click();

  // Details panel should appear (from mock provider we show route data)
  await expect(page.getByText('Route:')).toBeVisible({ timeout: 5000 });
});
