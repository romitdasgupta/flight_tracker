# Flight Tracker

A real-time web application that displays live aircraft positions on an interactive map. View flights, select them to see details, and track their routes.

## Features

- **Live Flight Visualization**: Real-time aircraft positions with animated markers showing heading/direction
- **Viewport-based Filtering**: Only fetches and displays flights within the current map viewport for performance
- **Flight Selection**: Click on any flight to view detailed information including altitude, speed, heading, airline, aircraft, and route
- **Flight Path Display**: View the flight path as a polyline on the map when a flight is selected
- **Multiple Data Providers**: Supports OpenSky Network (free) and Aviation Edge (API key required)
- **International Date Line Support**: Correctly displays flights when panning across the date line

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js (API proxy for secure key handling)
- **Mapping**: Leaflet + React-Leaflet + OpenStreetMap tiles
- **Testing**: Vitest + React Testing Library + MSW (unit tests), Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/yourusername/flight-tracker.git
cd flight-tracker
npm install
```

### Running the App

```bash
npm run dev
```

This starts both the Express backend (port 3001) and Vite dev server concurrently. On startup, the dev server prompts you to select a flight data provider. Providers are defined in `config/providers.json`. The selected provider is written to `public/runtime-provider.json`.

### Provider Configuration

#### OpenSky Network (Default)
No API key required. Free tier with rate limits.

#### Aviation Edge
Requires an API key. Set `AVIATION_EDGE_API_KEY` in your environment or `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local and add your API key
```

The API key is kept server-side only and never exposed to the browser. Get your API key at [aviation-edge.com](https://aviation-edge.com/)

### Production Build

```bash
# Build client and server
npm run build
npm run build:server

# Start production server
AVIATION_EDGE_API_KEY=your_key npm start
```

The Express server serves the static frontend from `dist/` and handles API proxying on a single port.

## Testing

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:run

# Run e2e tests
npm run test:e2e
```

## Project Structure

```
flight-tracker/
├── src/
│   ├── components/       # React components
│   │   ├── MapView.tsx           # Main map and flight rendering
│   │   ├── FlightDetailsPanel.tsx # Selected flight details
│   │   └── ViewportObserver.tsx   # Map viewport change detection
│   ├── lib/              # Utilities and hooks
│   │   ├── useFlights.ts         # Flight data fetching hook
│   │   ├── useFlightDetails.ts   # Flight details hook
│   │   ├── opensky.ts            # OpenSky Network API client
│   │   ├── aviationEdge.ts       # Aviation Edge API client
│   │   └── types.ts              # TypeScript interfaces
│   └── test/             # Test setup
├── server/               # Express backend
│   ├── index.ts                  # Server entry point
│   └── proxy.ts                  # API proxy routes
├── e2e/                  # Playwright e2e tests
├── config/               # Provider configuration
└── public/               # Static assets
```

## Attribution

- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Flight data: [OpenSky Network](https://opensky-network.org/) / [Aviation Edge](https://aviation-edge.com/)

## License

MIT
