import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlightDetailsPanel from './FlightDetailsPanel';
import type { FlightDetails, FlightState } from '../lib/types';

const flight: FlightState = {
  icao24: 'abc123',
  callsign: 'TEST123',
  latitude: 12,
  longitude: 22,
  altitude: 1000,
  velocity: 250,
  heading: 90
};

const details: FlightDetails = {
  icao24: 'abc123',
  callsign: 'TEST123',
  origin: { code: 'KSFO', name: 'San Francisco Intl', lat: 0, lon: 0 },
  destination: { code: 'KDEN', name: 'Denver Intl', lat: 1, lon: 1 },
  path: [
    { lat: 0, lon: 0 },
    { lat: 1, lon: 1 }
  ]
};

const units = {
  altitude: 'ft',
  speed: 'kt',
  verticalSpeed: 'ft/m'
};

describe('FlightDetailsPanel', () => {
  it('renders flight details and route info', () => {
    render(
      <FlightDetailsPanel
        flight={flight}
        details={details}
        loading={false}
        error={null}
        units={units}
      />
    );

    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText(/KSFO/)).toBeInTheDocument();
    expect(screen.getByText(/KDEN/)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/kt/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <FlightDetailsPanel
        flight={flight}
        details={null}
        loading={true}
        error={null}
        units={units}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
  });

  it('shows error state', () => {
    render(
      <FlightDetailsPanel
        flight={flight}
        details={null}
        loading={false}
        error={new Error('boom')}
        units={units}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load details.');
  });
});
