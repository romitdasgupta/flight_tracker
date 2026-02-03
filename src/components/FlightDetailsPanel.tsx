import type { FlightDetails, FlightState } from '../lib/types';

type FlightDetailsPanelProps = {
  flight: FlightState;
  details: FlightDetails | null;
  loading: boolean;
  error: Error | null;
  units: {
    altitude: string;
    speed: string;
    verticalSpeed: string;
  };
};

export default function FlightDetailsPanel({
  flight,
  details,
  loading,
  error,
  units
}: FlightDetailsPanelProps) {
  if (loading) {
    return (
      <div style={panelStyle} role="status">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle} role="alert">
        Failed to load details.
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>{flight.callsign ?? flight.icao24}</div>
      <div>Altitude: {formatValue(flight.altitude, units.altitude)}</div>
      <div>Speed: {formatValue(flight.velocity, units.speed)}</div>
      <div>Heading: {formatValue(flight.heading, '°')}</div>
      <div>Vertical speed: {formatValue(flight.verticalSpeed ?? null, units.verticalSpeed)}</div>
      <div>Status: {formatText(flight.status)}</div>
      <div>Squawk: {formatText(flight.squawk)}</div>
      <div>Airline: {formatText(formatAirline(flight))}</div>
      <div>Aircraft: {formatText(formatAircraft(flight))}</div>
      <div>Route: {formatRoute(flight, details)}</div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 12,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  fontSize: 12,
  minWidth: 200
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 6
};

function formatValue(value: number | null, unit: string) {
  if (value == null || Number.isNaN(value)) return 'N/A';
  return `${Math.round(value)} ${unit}`;
}

function formatText(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : 'N/A';
}

function formatAirline(flight: FlightState) {
  return flight.airlineIata || flight.airlineIcao || null;
}

function formatAircraft(flight: FlightState) {
  return flight.aircraftReg || flight.aircraftIcao || flight.aircraftIata || null;
}

function formatRoute(flight: FlightState, details: FlightDetails | null) {
  const origin =
    details?.origin?.code ??
    flight.originIata ??
    flight.originIcao ??
    null;
  const destination =
    details?.destination?.code ??
    flight.destinationIata ??
    flight.destinationIcao ??
    null;
  if (!origin && !destination) return '??? → ???';
  return `${origin ?? '???'} → ${destination ?? '???'}`;
}
