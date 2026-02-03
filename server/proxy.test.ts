import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createProxyRouter } from './proxy';

function createTestApp(apiKey: string | undefined, fetchFn?: typeof fetch) {
  const app = express();
  app.use('/api/proxy', createProxyRouter({ apiKey, fetchFn }));
  return app;
}

describe('proxy', () => {
  const mockApiKey = 'test-api-key-12345';
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  describe('GET /api/proxy/aviation-edge/flights', () => {
    it('proxies valid flight request with API key injected', async () => {
      const mockFlightData = [{ aircraft: { icao24: 'ABC123' } }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockFlightData)
      });

      const app = createTestApp(mockApiKey, mockFetch);
      const res = await request(app)
        .get('/api/proxy/aviation-edge/flights')
        .query({ lat: 40.7128, lng: -74.006, distance: 100 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockFlightData);

      // Verify API key was injected into the request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(calledUrl.searchParams.get('key')).toBe(mockApiKey);
      expect(calledUrl.searchParams.get('lat')).toBe('40.7128');
      expect(calledUrl.searchParams.get('lng')).toBe('-74.006');
      expect(calledUrl.searchParams.get('distance')).toBe('100');
    });

    it('passes limit parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      });

      const app = createTestApp(mockApiKey, mockFetch);
      await request(app)
        .get('/api/proxy/aviation-edge/flights')
        .query({ lat: 40, lng: -74, distance: 100, limit: 50 });

      const calledUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(calledUrl.searchParams.get('limit')).toBe('50');
    });

    describe('parameter validation', () => {
      it('returns 400 when lat is missing', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lng: -74, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required parameters');
      });

      it('returns 400 when lng is missing', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required parameters');
      });

      it('returns 400 when distance is missing', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required parameters');
      });

      it('returns 400 for lat out of bounds (> 90)', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 91, lng: -74, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid lat');
      });

      it('returns 400 for lat out of bounds (< -90)', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: -91, lng: -74, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid lat');
      });

      it('returns 400 for lng out of bounds (> 180)', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: 181, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid lng');
      });

      it('returns 400 for lng out of bounds (< -180)', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -181, distance: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid lng');
      });

      it('returns 400 for distance <= 0', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 0 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid distance');
      });

      it('returns 400 for distance > 500', async () => {
        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 501 });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid distance');
      });
    });

    describe('error handling', () => {
      it('returns 500 when API key is not configured', async () => {
        const app = createTestApp(undefined, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 100 });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Server configuration error');
        // Should not contain API key references
        expect(JSON.stringify(res.body)).not.toContain('key');
        expect(JSON.stringify(res.body)).not.toContain('api');
      });

      it('handles Aviation Edge API errors gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid API key' })
        });

        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 100 });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Aviation Edge API error');
      });

      it('handles fetch errors gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 100 });

        expect(res.status).toBe(502);
        expect(res.body.error).toBe('Failed to fetch flight data');
      });

      it('never exposes API key in error responses', async () => {
        mockFetch.mockRejectedValueOnce(new Error(`Request failed with key ${mockApiKey}`));

        const app = createTestApp(mockApiKey, mockFetch);
        const res = await request(app)
          .get('/api/proxy/aviation-edge/flights')
          .query({ lat: 40, lng: -74, distance: 100 });

        const responseText = JSON.stringify(res.body);
        expect(responseText).not.toContain(mockApiKey);
        expect(responseText).not.toContain('test-api-key');
      });
    });
  });
});
