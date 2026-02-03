# Flight Tracker

Simple web flight tracker that renders live flights on a Leaflet map and filters them to the current viewport.

## Stack
- React + TypeScript + Vite
- Leaflet + OpenStreetMap tiles
- Vitest + React Testing Library + MSW
- Playwright (e2e)

## Getting started
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
npm run test:run
npm run test:e2e
```

## Attribution
- Map tiles: OpenStreetMap contributors
- Flight data: OpenSky Network

## Pluggable flight details provider
v2 uses a provider interface for flight details (origin/destination/path). The default provider is a mock implementation.
Replace `flightDetailsProvider` in `src/lib/providers.ts` with a real API-backed provider when ready.
