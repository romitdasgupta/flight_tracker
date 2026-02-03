export type Bbox = {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
};

export type FlightState = {
  icao24: string;
  callsign: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
};

export type LatLng = {
  lat: number;
  lon: number;
};

export type Airport = LatLng & {
  code: string;
  name: string;
};

export type FlightDetails = {
  icao24: string;
  callsign: string | null;
  origin?: Airport;
  destination?: Airport;
  path: LatLng[];
};

export type FlightDetailsProvider = {
  getFlightDetails: (icao24: string) => Promise<FlightDetails | null>;
};

export type BoundsLike = {
  south: number;
  west: number;
  north: number;
  east: number;
};
