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

  async function getStates(bbox: Bbox): Promise<FlightState[]> {
    const key = JSON.stringify(bbox);
    const now = Date.now();
    if (lastKey === key && now - lastFetchedAt < cacheMs) {
      return lastResult;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('lamin', bbox.minLat.toString());
    url.searchParams.set('lomin', bbox.minLon.toString());
    url.searchParams.set('lamax', bbox.maxLat.toString());
    url.searchParams.set('lomax', bbox.maxLon.toString());

    const response = await fetchFn(url.toString());
    if (!response.ok) {
      throw new Error('OpenSky request failed');
    }

    const data = (await response.json()) as OpenSkyResponse;
    const states = data.states ?? [];

    const mapped = states.map((state) => {
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

    lastKey = key;
    lastFetchedAt = now;
    lastResult = mapped;

    return mapped;
  }

  return { getStates };
}
