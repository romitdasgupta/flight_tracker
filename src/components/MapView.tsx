import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import type { Bbox } from '../lib/types';
import { useOpenSkyFlights } from '../lib/useFlights';
import { filterFlightsByBbox } from '../lib/filter';
import ViewportObserver from './ViewportObserver';
import { flightDetailsProvider } from '../lib/providers';
import { useFlightDetails } from '../lib/useFlightDetails';
import FlightDetailsPanel from './FlightDetailsPanel';

const DEFAULT_CENTER: [number, number] = [37.773972, -122.431297];
const DEFAULT_ZOOM = 5;

export default function MapView() {
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);
  const { flights, loading, error } = useOpenSkyFlights({ bbox });
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
    return filterFlightsByBbox(flights, bbox);
  }, [bbox, flights]);

  const selectedFlight = useMemo(
    () =>
      visibleFlights.find((flight) => flight.icao24 === selectedIcao) ??
      (isE2E && selectedIcao === e2eFlight.icao24 ? e2eFlight : null),
    [selectedIcao, visibleFlights, isE2E]
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
          <CircleMarker
            key={flight.icao24}
            center={[flight.latitude ?? 0, flight.longitude ?? 0]}
            radius={4}
            pathOptions={{ color: '#1f4b99', fillColor: '#1f4b99' }}
            eventHandlers={{
              click: () => setSelectedIcao(flight.icao24)
            }}
          />
        ))}
        {visibleFlights.map((flight) => (
          <CircleMarker
            key={`${flight.icao24}-label`}
            center={[flight.latitude ?? 0, flight.longitude ?? 0]}
            radius={0}
            pathOptions={{ opacity: 0 }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={0.9} permanent>
              {flight.callsign ?? flight.icao24}
            </Tooltip>
          </CircleMarker>
        ))}

        {details?.path.length ? (
          <Polyline
            positions={details.path.map((point) => [point.lat, point.lon])}
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
      <div style={attributionStyle}>
        Data: OpenSky Network
      </div>
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
