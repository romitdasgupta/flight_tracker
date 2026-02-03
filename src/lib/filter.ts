import type { Bbox, FlightState } from './types';

export function filterFlightsByBbox(flights: FlightState[], bbox: Bbox): FlightState[] {
  return flights.filter((flight) => {
    const { latitude, longitude } = flight;
    if (latitude == null || longitude == null) return false;
    const inLat = latitude >= bbox.minLat && latitude <= bbox.maxLat;
    if (!inLat) return false;
    if (bbox.wrapsDateline || bbox.minLon > bbox.maxLon) {
      return longitude >= bbox.minLon || longitude <= bbox.maxLon;
    }
    return longitude >= bbox.minLon && longitude <= bbox.maxLon;
  });
}
