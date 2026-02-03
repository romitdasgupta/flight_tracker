import type { FlightDetails, FlightDetailsProvider, LatLng } from './types';

const MOCK_PATH: LatLng[] = [
  { lat: 37.6213, lon: -122.3790 },
  { lat: 38.5, lon: -121.5 },
  { lat: 39.1, lon: -120.8 }
];

const MOCK_DATA: Record<string, FlightDetails> = {
  abc123: {
    icao24: 'abc123',
    callsign: 'TEST123',
    origin: { code: 'KSFO', name: 'San Francisco Intl', lat: 37.6213, lon: -122.3790 },
    destination: { code: 'KDEN', name: 'Denver Intl', lat: 39.8561, lon: -104.6737 },
    path: MOCK_PATH
  },
  def456: {
    icao24: 'def456',
    callsign: 'TEST456',
    origin: { code: 'KLAX', name: 'Los Angeles Intl', lat: 33.9416, lon: -118.4085 },
    destination: { code: 'KSEA', name: 'Seattle Tacoma Intl', lat: 47.4502, lon: -122.3088 },
    path: [
      { lat: 33.9416, lon: -118.4085 },
      { lat: 36.5, lon: -120.0 },
      { lat: 39.2, lon: -121.0 },
      { lat: 42.0, lon: -122.0 },
      { lat: 47.4502, lon: -122.3088 }
    ]
  }
};

export function createMockFlightDetailsProvider(delayMs = 100): FlightDetailsProvider {
  return {
    async getFlightDetails(icao24: string) {
      const details = MOCK_DATA[icao24] ?? null;
      if (delayMs <= 0) return details;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return details;
    }
  };
}
