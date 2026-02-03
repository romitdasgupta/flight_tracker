import type { Bbox, FlightState } from './types';

type AviationEdgeClientOptions = {
  baseUrl: string;
  apiKey: string | null;
  limit?: number;
  fetchFn?: typeof fetch;
};

type AviationEdgeFlight = {
  aircraft?: {
    icao24?: string | null;
    iataCode?: string | null;
    icaoCode?: string | null;
    regNumber?: string | null;
  };
  airline?: {
    iataCode?: string | null;
    icaoCode?: string | null;
    name?: string | null;
  };
  departure?: {
    iataCode?: string | null;
    icaoCode?: string | null;
  };
  arrival?: {
    iataCode?: string | null;
    icaoCode?: string | null;
  };
  flight?: {
    icaoNumber?: string | null;
    iataNumber?: string | null;
    number?: string | null;
  };
  geography?: {
    latitude?: number | null;
    longitude?: number | null;
    altitude?: number | null;
    direction?: number | null;
  };
  speed?: {
    horizontal?: number | null;
    vspeed?: number | null;
    isGround?: number | null;
  };
  system?: {
    squawk?: string | null;
    updated?: number | null;
  };
  status?: string | null;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function bboxToSearchParams(bbox: Bbox) {
  const centerLat = (bbox.minLat + bbox.maxLat) / 2;
  const centerLon = (bbox.minLon + bbox.maxLon) / 2;
  const cornerDistance = distanceKm(centerLat, centerLon, bbox.maxLat, bbox.maxLon);

  return {
    lat: centerLat,
    lon: centerLon,
    distanceKm: Math.ceil(cornerDistance)
  };
}

export function createAviationEdgeClient(options: AviationEdgeClientOptions) {
  const fetchFn = options.fetchFn ?? fetch;

  async function getStates(bbox: Bbox): Promise<FlightState[]> {
    if (!options.apiKey) {
      throw new Error('Aviation Edge API key missing');
    }

    const { lat, lon, distanceKm } = bboxToSearchParams(bbox);
    const url = new URL(options.baseUrl);
    url.searchParams.set('key', options.apiKey);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lng', lon.toString());
    url.searchParams.set('distance', distanceKm.toString());
    if (options.limit) {
      url.searchParams.set('limit', options.limit.toString());
    }

    const response = await fetchFn(url.toString());
    if (!response.ok) {
      throw new Error('Aviation Edge request failed');
    }

    const data = (await response.json()) as AviationEdgeFlight[] | { error: string };
    if (!Array.isArray(data)) {
      const message = typeof data?.error === 'string' ? data.error : 'Aviation Edge request failed';
      throw new Error(message);
    }

    const mapped = data.map((flight) => {
      const latitude = flight.geography?.latitude ?? null;
      const longitude = flight.geography?.longitude ?? null;

      return {
        icao24: String(flight.aircraft?.icao24 ?? '').trim(),
        callsign: flight.flight?.icaoNumber ?? flight.flight?.iataNumber ?? null,
        flightIata: flight.flight?.iataNumber ?? null,
        flightIcao: flight.flight?.icaoNumber ?? null,
        airlineIata: flight.airline?.iataCode ?? null,
        airlineIcao: flight.airline?.icaoCode ?? null,
        aircraftIata: flight.aircraft?.iataCode ?? null,
        aircraftIcao: flight.aircraft?.icaoCode ?? null,
        aircraftReg: flight.aircraft?.regNumber ?? null,
        originIata: flight.departure?.iataCode ?? null,
        originIcao: flight.departure?.icaoCode ?? null,
        destinationIata: flight.arrival?.iataCode ?? null,
        destinationIcao: flight.arrival?.icaoCode ?? null,
        latitude,
        longitude,
        altitude: flight.geography?.altitude ?? null,
        velocity: flight.speed?.horizontal ?? null,
        heading: flight.geography?.direction ?? null,
        verticalSpeed: flight.speed?.vspeed ?? null,
        isGround: flight.speed?.isGround ?? null,
        status: flight.status ?? null,
        squawk: flight.system?.squawk ?? null,
        updated: flight.system?.updated ?? null
      } satisfies FlightState;
    });

    return Array.from(new Map(mapped.map((f) => [f.icao24, f])).values());
  }

  return { getStates };
}
