import { Router, Request, Response } from 'express';

const AVIATION_EDGE_BASE_URL = 'https://aviation-edge.com/v2/public/flights';

type ProxyDeps = {
  apiKey: string | undefined;
  fetchFn?: typeof fetch;
};

function isValidLat(val: unknown): boolean {
  const num = Number(val);
  return !isNaN(num) && num >= -90 && num <= 90;
}

function isValidLng(val: unknown): boolean {
  const num = Number(val);
  return !isNaN(num) && num >= -180 && num <= 180;
}

function isValidDistance(val: unknown): boolean {
  const num = Number(val);
  return !isNaN(num) && num > 0 && num <= 500;
}

export function createProxyRouter(deps: ProxyDeps): Router {
  const router = Router();
  const fetchFn = deps.fetchFn ?? fetch;

  router.get('/aviation-edge/flights', async (req: Request, res: Response) => {
    const { lat, lng, distance, limit } = req.query;

    // Validate required parameters
    if (!lat || !lng || !distance) {
      res.status(400).json({ error: 'Missing required parameters: lat, lng, distance' });
      return;
    }

    // Validate parameter bounds
    if (!isValidLat(lat)) {
      res.status(400).json({ error: 'Invalid lat: must be between -90 and 90' });
      return;
    }

    if (!isValidLng(lng)) {
      res.status(400).json({ error: 'Invalid lng: must be between -180 and 180' });
      return;
    }

    if (!isValidDistance(distance)) {
      res.status(400).json({ error: 'Invalid distance: must be between 1 and 500' });
      return;
    }

    // Check for API key
    if (!deps.apiKey) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    try {
      const url = new URL(AVIATION_EDGE_BASE_URL);
      url.searchParams.set('key', deps.apiKey);
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lng', String(lng));
      url.searchParams.set('distance', String(distance));
      if (limit) {
        url.searchParams.set('limit', String(limit));
      }

      const response = await fetchFn(url.toString());
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        console.error(`[Proxy] Aviation Edge returned ${response.status}`);
        res.status(response.status).json({ error: 'Aviation Edge API error' });
        return;
      }

      // Ensure we received JSON
      if (!contentType.includes('application/json')) {
        console.error(`[Proxy] Aviation Edge returned non-JSON: ${contentType}`);
        res.status(502).json({ error: 'Invalid response from Aviation Edge' });
        return;
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      // Log error server-side but don't expose details to client
      console.error('[Proxy] Aviation Edge request failed:', error);
      res.status(502).json({ error: 'Failed to fetch flight data' });
    }
  });

  return router;
}
