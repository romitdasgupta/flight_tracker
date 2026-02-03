import { act } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('../lib/runtimeConfig', () => ({
  FALLBACK_PROVIDER: {
    id: 'opensky',
    name: 'OpenSky',
    type: 'opensky',
    baseUrl: 'https://opensky-network.org/api/states/all',
    attribution: 'Data: OpenSky Network'
  },
  loadRuntimeProvider: () =>
    Promise.resolve({
      id: 'opensky',
      name: 'OpenSky',
      type: 'opensky',
      baseUrl: 'https://opensky-network.org/api/states/all',
      attribution: 'Data: OpenSky Network'
    })
}));

vi.mock('../components/MapView', () => ({
  default: () => <div data-testid="map-root" />
}));

describe('App integration', () => {
  it('renders the map container', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(await screen.findByTestId('map-root')).toBeInTheDocument();
  });
});
