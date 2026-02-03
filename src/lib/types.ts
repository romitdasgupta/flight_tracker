export type Bbox = {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  wrapsDateline?: boolean;
  viewCenterLng?: number;
};

export type FlightState = {
  icao24: string;
  callsign: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  verticalSpeed?: number | null;
  isGround?: number | null;
  status?: string | null;
  squawk?: string | null;
  updated?: number | null;
  airlineIata?: string | null;
  airlineIcao?: string | null;
  flightIata?: string | null;
  flightIcao?: string | null;
  aircraftIata?: string | null;
  aircraftIcao?: string | null;
  aircraftReg?: string | null;
  originIata?: string | null;
  originIcao?: string | null;
  destinationIata?: string | null;
  destinationIcao?: string | null;
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
