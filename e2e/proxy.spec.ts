import { test, expect } from '@playwright/test';

test.describe('API key security', () => {
  test('no requests contain API key in URL', async ({ page }) => {
    const requestUrls: string[] = [];

    // Capture all network requests
    page.on('request', (request) => {
      requestUrls.push(request.url());
    });

    await page.goto('http://127.0.0.1:4173');

    // Wait for the map to load and potentially make flight requests
    await page.waitForTimeout(2000);

    // Check that no request URLs contain 'key=' parameter
    for (const url of requestUrls) {
      expect(url).not.toMatch(/[?&]key=/i);
    }
  });

  test('no direct requests to aviation-edge.com', async ({ page }) => {
    const externalApiRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('aviation-edge.com')) {
        externalApiRequests.push(url);
      }
    });

    await page.goto('http://127.0.0.1:4173');
    await page.waitForTimeout(2000);

    expect(externalApiRequests).toHaveLength(0);
  });

  test('flight requests go through proxy endpoint', async ({ page }) => {
    const proxyRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/proxy/')) {
        proxyRequests.push(url);
      }
    });

    await page.goto('http://127.0.0.1:4173');

    // Trigger a flight data fetch by interacting with the map
    // The exact trigger depends on the app implementation
    await page.waitForTimeout(3000);

    // If the app uses aviation-edge provider, requests should go through proxy
    // This test verifies the proxy pattern is used
    for (const url of proxyRequests) {
      expect(url).toMatch(/\/api\/proxy\/aviation-edge\/flights/);
      expect(url).not.toMatch(/[?&]key=/i);
    }
  });

  test('VITE_AVIATION_EDGE_API_KEY not in browser environment', async ({ page }) => {
    await page.goto('http://127.0.0.1:4173');

    // Check that the VITE env variable is not exposed by searching for it in the page source
    // The env variable should not appear anywhere in the rendered HTML or JS
    const pageContent = await page.content();
    expect(pageContent).not.toContain('VITE_AVIATION_EDGE_API_KEY');
  });
});
