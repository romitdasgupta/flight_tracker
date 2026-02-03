import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MapView from './MapView';
import type { FlightState } from '../lib/types';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({
    position,
    children,
    eventHandlers
  }: {
    position: [number, number];
    children?: ReactNode;
    eventHandlers?: { click?: () => void; mouseover?: () => void; mouseout?: () => void };
  }) => (
    <div
      data-testid="marker"
      data-center={`${position[0]},${position[1]}`}
      onClick={() => eventHandlers?.click?.()}
      onMouseOver={() => eventHandlers?.mouseover?.()}
      onMouseOut={() => eventHandlers?.mouseout?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="label" data-class={className}>{children}</div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Polyline: () => null
}));

const mockUseFlights = vi.fn();
vi.mock('../lib/useFlights', () => ({
  useFlights: (...args: unknown[]) => mockUseFlights(...args)
}));

const mockUseFlightDetails = vi.fn();
vi.mock('../lib/useFlightDetails', () => ({
  useFlightDetails: (...args: unknown[]) => mockUseFlightDetails(...args)
}));

vi.mock('../lib/providers', () => ({
  flightDetailsProvider: { getFlightDetails: vi.fn() }
}));

vi.mock('./ViewportObserver', () => ({
  default: ({ onBboxChange }: { onBboxChange: (bbox: any) => void }) => {
    onBboxChange({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });
    return null;
  }
}));

const flights: FlightState[] = [
  {
    icao24: 'abc123',
    callsign: 'TEST123',
    latitude: 12,
    longitude: 22,
    altitude: 1000,
    velocity: 250,
    heading: 90
  }
];

describe('MapView labels', () => {
  it('renders labels for visible flights', () => {
    mockUseFlights.mockReturnValue({
      flights,
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(
      <MapView
        provider={{
          id: 'opensky',
          name: 'OpenSky',
          attribution: 'Data: OpenSky Network',
          getStates: vi.fn()
        }}
      />
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveTextContent('TEST123');
    expect(label).toHaveAttribute('data-class', 'flight-label');
  });
});
