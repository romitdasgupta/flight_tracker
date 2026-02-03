import type { Bbox, FlightState } from './types';

export function filterFlightsByBbox(flights: FlightState[], bbox: Bbox): FlightState[] {
  return flights.filter((flight) => {
    const { latitude, longitude } = flight;
    if (latitude == null || longitude == null) return false;
    return (
      latitude >= bbox.minLat &&
      latitude <= bbox.maxLat &&
      longitude >= bbox.minLon &&
      longitude <= bbox.maxLon
    );
  });
}
