import { describe, expect, it } from 'vitest';
import { filterFlightsByBbox } from './filter';
import type { FlightState } from './types';

const bbox = { minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 };

function flight(partial: Partial<FlightState>): FlightState {
  return {
    icao24: 'abc123',
    callsign: 'TEST123',
    latitude: 15,
    longitude: 25,
    altitude: 10000,
    velocity: 250,
    heading: 90,
    ...partial
  };
}

describe('filterFlightsByBbox', () => {
  it('keeps flights inside bbox', () => {
    const flights = [flight({ latitude: 12, longitude: 22 })];
    expect(filterFlightsByBbox(flights, bbox)).toHaveLength(1);
  });

  it('drops flights outside bbox', () => {
    const flights = [flight({ latitude: 50, longitude: 22 })];
    expect(filterFlightsByBbox(flights, bbox)).toHaveLength(0);
  });

  it('drops flights with missing coordinates', () => {
    const flights = [flight({ latitude: null, longitude: 22 })];
    expect(filterFlightsByBbox(flights, bbox)).toHaveLength(0);
  });

  it('includes flights on bbox edge', () => {
    const flights = [flight({ latitude: 10, longitude: 40 })];
    expect(filterFlightsByBbox(flights, bbox)).toHaveLength(1);
  });
});
