import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { useFlights } from './useFlights';
import { createOpenSkyClient } from './opensky';

const baseUrl = 'https://example.test/opensky';

const response = {
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

describe('useFlights', () => {
  it('does not fetch when bbox is null', async () => {
    const client = createOpenSkyClient({ baseUrl });
    const provider = {
      id: 'opensky',
      name: 'OpenSky',
      attribution: 'Data: OpenSky Network',
      getStates: client.getStates
    };
    const { result } = renderHook(() =>
      useFlights({ bbox: null, provider })
    );

    expect(result.current.flights).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches when bbox is provided', async () => {
    server.use(http.get(baseUrl, () => HttpResponse.json(response)));
    const client = createOpenSkyClient({ baseUrl, cacheMs: 0 });
    const provider = {
      id: 'opensky',
      name: 'OpenSky',
      attribution: 'Data: OpenSky Network',
      getStates: client.getStates
    };

    const { result } = renderHook(() =>
      useFlights({
        bbox: { minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 },
        provider
      })
    );

    await waitFor(() => expect(result.current.flights).toHaveLength(1));

    expect(result.current.flights).toHaveLength(1);
    expect(result.current.flights[0].icao24).toBe('abc123');
    expect(result.current.error).toBeNull();
  });
});
