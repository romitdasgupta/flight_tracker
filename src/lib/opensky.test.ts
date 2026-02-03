import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { createOpenSkyClient } from './opensky';

const baseUrl = 'https://example.test/opensky';

const sampleResponse = {
  time: 123,
  states: [
    [
      'abc123',
      'TEST123 ',
      'United States',
      0,
      0,
      12.34,
      56.78,
      1000,
      false,
      200,
      90,
      0,
      null,
      1200,
      '7700',
      false,
      0
    ]
  ]
};

describe('createOpenSkyClient', () => {
  it('builds bbox query params', async () => {
    server.use(
      http.get(baseUrl, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('lamin')).toBe('10');
        expect(url.searchParams.get('lomin')).toBe('20');
        expect(url.searchParams.get('lamax')).toBe('30');
        expect(url.searchParams.get('lomax')).toBe('40');
        return HttpResponse.json({ time: 0, states: [] });
      })
    );

    const client = createOpenSkyClient({ baseUrl, cacheMs: 0 });
    await client.getStates({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });
  });

  it('maps OpenSky states to FlightState', async () => {
    server.use(
      http.get(baseUrl, () => HttpResponse.json(sampleResponse))
    );

    const client = createOpenSkyClient({ baseUrl, cacheMs: 0 });
    const result = await client.getStates({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });

    expect(result).toEqual([
      {
        icao24: 'abc123',
        callsign: 'TEST123',
        latitude: 56.78,
        longitude: 12.34,
        altitude: 1200,
        velocity: 200,
        heading: 90
      }
    ]);
  });

  it('throws on server error', async () => {
    server.use(
      http.get(baseUrl, () => new HttpResponse('fail', { status: 500 }))
    );

    const client = createOpenSkyClient({ baseUrl, cacheMs: 0 });
    await expect(
      client.getStates({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 })
    ).rejects.toThrow('OpenSky request failed');
  });

  it('caches within cache window', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(() => HttpResponse.json(sampleResponse));

    server.use(http.get(baseUrl, handler));

    const client = createOpenSkyClient({ baseUrl, cacheMs: 10_000 });
    const bbox = { minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 };

    await client.getStates(bbox);
    await client.getStates(bbox);

    expect(handler).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10_001);

    await client.getStates(bbox);
    expect(handler).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
