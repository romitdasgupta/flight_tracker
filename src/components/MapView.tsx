import { useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import type { Bbox } from '../lib/types';
import { useFlights } from '../lib/useFlights';
import { filterFlightsByBbox } from '../lib/filter';
import ViewportObserver from './ViewportObserver';
import { flightDetailsProvider } from '../lib/providers';
import { useFlightDetails } from '../lib/useFlightDetails';
import FlightDetailsPanel from './FlightDetailsPanel';
import { createFlightIcon } from '../lib/marker';
import type { FlightProvider } from '../lib/flightProviders';

const DEFAULT_CENTER: [number, number] = [37.773972, -122.431297];
const DEFAULT_ZOOM = 5;

type MapViewProps = {
  provider: FlightProvider;
};

export default function MapView({ provider }: MapViewProps) {
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);
  const { flights, loading, error } = useFlights({ bbox, provider });
  const { details, loading: detailsLoading, error: detailsError } = useFlightDetails(
    selectedIcao,
    flightDetailsProvider
  );

  const isE2E = import.meta.env.VITE_E2E === '1';
  const e2eFlight = {
    icao24: 'abc123',
    callsign: 'TEST123',
    latitude: 37.773972,
    longitude: -122.431297,
    altitude: 1000,
    velocity: 250,
    heading: 90
  };

  const visibleFlights = useMemo(() => {
    if (!bbox) return [];
    const filtered = filterFlightsByBbox(flights, bbox);
    if (import.meta.env.DEV) {
      console.debug('[MapView] visible flights', {
        total: flights.length,
        visible: filtered.length,
        bbox
      });
    }
    return filtered;
  }, [bbox, flights]);

  // Adjust longitude to be within 180 degrees of the view center
  // This ensures markers appear in the correct world copy when panning across the dateline
  const adjustLongitude = useMemo(() => {
    const viewCenter = bbox?.viewCenterLng ?? 0;
    return (lng: number) => {
      let adjusted = lng;
      while (adjusted - viewCenter > 180) adjusted -= 360;
      while (adjusted - viewCenter < -180) adjusted += 360;
      return adjusted;
    };
  }, [bbox?.viewCenterLng]);

  const selectedFlight = useMemo(
    () =>
      visibleFlights.find((flight) => flight.icao24 === selectedIcao) ??
      (isE2E && selectedIcao === e2eFlight.icao24 ? e2eFlight : null),
    [selectedIcao, visibleFlights, isE2E]
  );

  const units = useMemo(
    () =>
      provider.id === 'aviation-edge'
        ? { altitude: 'm', speed: 'km/h', verticalSpeed: 'm/s' }
        : { altitude: 'm', speed: 'm/s', verticalSpeed: 'm/s' },
    [provider.id]
  );

  return (
    <div
      data-testid="map-root"
      style={{ height: '100%', width: '100%', position: 'relative' }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportObserver onBboxChange={setBbox} />

        {visibleFlights.map((flight) => (
          <Marker
            key={flight.icao24}
            position={[flight.latitude ?? 0, adjustLongitude(flight.longitude ?? 0)]}
            icon={createFlightIcon(flight.heading)}
            eventHandlers={{
              click: () => setSelectedIcao(flight.icao24),
              mouseover: (event) => {
                event?.target?.openPopup?.();
              },
              mouseout: (event) => {
                event?.target?.closePopup?.();
              }
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -6]}
              opacity={0.95}
              permanent
              className="flight-label"
            >
              {flight.callsign ?? flight.icao24}
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {flight.callsign ?? flight.icao24}
                </div>
                <div>Altitude: {formatValue(flight.altitude, units.altitude)}</div>
                <div>Speed: {formatValue(flight.velocity, units.speed)}</div>
                <div>Heading: {formatValue(flight.heading, '°')}</div>
                <div>
                  Vertical speed:{' '}
                  {formatValue(flight.verticalSpeed ?? null, units.verticalSpeed)}
                </div>
                <div>Status: {formatText(flight.status)}</div>
                <div>Squawk: {formatText(flight.squawk)}</div>
                <div>Airline: {formatText(formatAirline(flight))}</div>
                <div>Aircraft: {formatText(formatAircraft(flight))}</div>
                <div>
                  Route: {formatRoute(flight, selectedIcao === flight.icao24 ? details : null)}
                </div>
                <div>Last update: {formatUpdated(flight.updated)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {details?.path.length ? (
          <Polyline
            positions={details.path.map((point) => [point.lat, adjustLongitude(point.lon)])}
            pathOptions={{ color: '#f05d23', weight: 2 }}
          />
        ) : null}
      </MapContainer>

      {selectedFlight && (
        <FlightDetailsPanel
          flight={selectedFlight}
          details={details}
          loading={detailsLoading}
          error={detailsError}
          units={units}
        />
      )}

      {isE2E && (
        <button
          type="button"
          onClick={() => setSelectedIcao(e2eFlight.icao24)}
          style={e2eButtonStyle}
          data-testid="e2e-select"
        >
          Select test flight
        </button>
      )}

      {loading && (
        <div style={overlayStyle} role="status">
          Loading flights...
        </div>
      )}
      {error && (
        <div style={overlayStyle} role="alert">
          Failed to load flights.
        </div>
      )}
      <div style={attributionStyle}>{provider.attribution}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  padding: '6px 10px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 4,
  fontSize: 12
};

const attributionStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  bottom: 12,
  padding: '4px 8px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 4,
  fontSize: 11
};

const e2eButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  bottom: 12,
  padding: '4px 8px',
  fontSize: 11,
  borderRadius: 4,
  border: '1px solid #c9c9c9',
  background: '#ffffff'
};

function formatValue(value: number | null, unit: string) {
  if (value == null || Number.isNaN(value)) return 'N/A';
  return `${Math.round(value)} ${unit}`;
}

function formatText(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : 'N/A';
}

function formatAirline(flight: { airlineIata?: string | null; airlineIcao?: string | null }) {
  return flight.airlineIata || flight.airlineIcao || null;
}

function formatAircraft(flight: {
  aircraftReg?: string | null;
  aircraftIcao?: string | null;
  aircraftIata?: string | null;
}) {
  return flight.aircraftReg || flight.aircraftIcao || flight.aircraftIata || null;
}

function formatRoute(
  flight: {
    originIata?: string | null;
    originIcao?: string | null;
    destinationIata?: string | null;
    destinationIcao?: string | null;
  },
  details: { origin?: { code: string }; destination?: { code: string } } | null
) {
  const origin = details?.origin?.code ?? flight.originIata ?? flight.originIcao ?? null;
  const destination =
    details?.destination?.code ?? flight.destinationIata ?? flight.destinationIcao ?? null;
  if (!origin && !destination) return '??? → ???';
  return `${origin ?? '???'} → ${destination ?? '???'}`;
}

function formatUpdated(updated: number | null | undefined) {
  if (!updated) return 'N/A';
  const date = new Date(updated * 1000);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}
