import { test, expect } from '@playwright/test';

test('app loads and map container is visible', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
  const map = page.getByTestId('map-root');
  await expect(map).toBeVisible();
});
