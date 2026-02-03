import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { useOpenSkyFlights } from './useFlights';

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

describe('useOpenSkyFlights', () => {
  it('does not fetch when bbox is null', async () => {
    const { result } = renderHook(() =>
      useOpenSkyFlights({ bbox: null, baseUrl })
    );

    expect(result.current.flights).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches when bbox is provided', async () => {
    server.use(http.get(baseUrl, () => HttpResponse.json(response)));

    const { result } = renderHook(() =>
      useOpenSkyFlights({
        bbox: { minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 },
        baseUrl
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.flights).toHaveLength(1);
    expect(result.current.flights[0].icao24).toBe('abc123');
    expect(result.current.error).toBeNull();
  });
});
