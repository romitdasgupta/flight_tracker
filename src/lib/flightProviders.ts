import type { Bbox, FlightState } from './types';
import type { ProviderConfig } from './providerConfig';
import { createOpenSkyClient } from './opensky';
import { createAviationEdgeClient } from './aviationEdge';

export type FlightProvider = {
  id: string;
  name: string;
  attribution: string;
  getStates: (bbox: Bbox) => Promise<FlightState[]>;
};

export function createFlightProvider(config: ProviderConfig): FlightProvider {
  if (config.type === 'opensky') {
    const client = createOpenSkyClient({ baseUrl: config.baseUrl });
    return {
      id: config.id,
      name: config.name,
      attribution: config.attribution,
      getStates: client.getStates
    };
  }

  if (config.type === 'aviation-edge') {
    const client = createAviationEdgeClient({
      baseUrl: config.baseUrl,
      limit: config.params?.limit
    });

    return {
      id: config.id,
      name: config.name,
      attribution: config.attribution,
      getStates: client.getStates
    };
  }

  throw new Error(`Unsupported provider type: ${config.type}`);
}
