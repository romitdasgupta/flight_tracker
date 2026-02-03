import type { Bbox, FlightState } from './types';

type OpenSkyClientOptions = {
  baseUrl?: string;
  cacheMs?: number;
  fetchFn?: typeof fetch;
};

type OpenSkyResponse = {
  time: number;
  states: (string | number | boolean | null)[][] | null;
};

const DEFAULT_BASE_URL = 'https://opensky-network.org/api/states/all';

export function createOpenSkyClient(options: OpenSkyClientOptions = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const cacheMs = options.cacheMs ?? 10_000;
  const fetchFn = options.fetchFn ?? fetch;

  let lastKey: string | null = null;
  let lastFetchedAt = 0;
  let lastResult: FlightState[] = [];

  async function fetchStates(bounds: Bbox): Promise<FlightState[]> {
    const url = new URL(baseUrl);
    url.searchParams.set('lamin', bounds.minLat.toString());
    url.searchParams.set('lomin', bounds.minLon.toString());
    url.searchParams.set('lamax', bounds.maxLat.toString());
    url.searchParams.set('lomax', bounds.maxLon.toString());

    const response = await fetchFn(url.toString());
    if (!response.ok) {
      throw new Error('OpenSky request failed');
    }

    const data = (await response.json()) as OpenSkyResponse;
    const states = data.states ?? [];

    return states.map((state) => {
      const icao24 = String(state[0] ?? '').trim();
      const callsign = state[1] ? String(state[1]).trim() : null;
      const longitude = state[5] == null ? null : Number(state[5]);
      const latitude = state[6] == null ? null : Number(state[6]);
      const velocity = state[9] == null ? null : Number(state[9]);
      const heading = state[10] == null ? null : Number(state[10]);
      const altitude = state[13] == null ? null : Number(state[13]);

      return {
        icao24,
        callsign,
        latitude,
        longitude,
        altitude,
        velocity,
        heading
      } satisfies FlightState;
    });
  }

  async function getStates(bbox: Bbox): Promise<FlightState[]> {
    const key = JSON.stringify(bbox);
    const now = Date.now();

    // Cache: If same bounds and fresh enough, return last result.
    if (lastKey === key && now - lastFetchedAt < cacheMs) {
      return lastResult;
    }

    // Rate limit: If different bounds but too soon, return last result to avoid 429.
    // OpenSky anonymous limit is ~10s resolution, potentially strict rate limits.
    const RELAXED_Refetch_Interval = 5000;
    if (now - lastFetchedAt < RELAXED_Refetch_Interval) {
      return lastResult;
    }

    let mapped: FlightState[] = [];
    if (bbox.wrapsDateline || bbox.minLon > bbox.maxLon) {
      const left = await fetchStates({
        minLat: bbox.minLat,
        maxLat: bbox.maxLat,
        minLon: bbox.minLon,
        maxLon: 180
      });
      const right = await fetchStates({
        minLat: bbox.minLat,
        maxLat: bbox.maxLat,
        minLon: -180,
        maxLon: bbox.maxLon
      });
      mapped = left.concat(right);
    } else {
      mapped = await fetchStates(bbox);
    }

    const unique = Array.from(new Map(mapped.map((f) => [f.icao24, f])).values());

    lastKey = key;
    lastFetchedAt = now;
    lastResult = unique;

    return unique;
  }

  return { getStates };
}
