import airportData from '../data/airports.json';

export type AirportCoords = { lat: number; lon: number };

const airports = airportData as Record<string, AirportCoords>;

export function getAirportCoords(code: string): AirportCoords | null {
  return airports[code] ?? null;
}

export function lookupAirport(
  iata?: string | null,
  icao?: string | null
): AirportCoords | null {
  if (iata) {
    const coords = getAirportCoords(iata);
    if (coords) return coords;
  }
  if (icao) {
    const coords = getAirportCoords(icao);
    if (coords) return coords;
  }
  return null;
}
