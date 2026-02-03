import { useEffect, useMemo, useState } from 'react';
import MapView from './components/MapView';
import { createFlightProvider } from './lib/flightProviders';
import { FALLBACK_PROVIDER, loadRuntimeProvider } from './lib/runtimeConfig';
import type { ProviderConfig } from './lib/providerConfig';

export default function App() {
  const [providerConfig, setProviderConfig] = useState<ProviderConfig | null>(null);

  useEffect(() => {
    let active = true;
    loadRuntimeProvider()
      .then((config) => {
        if (active) setProviderConfig(config);
      })
      .catch(() => {
        if (active) setProviderConfig(FALLBACK_PROVIDER);
      });

    return () => {
      active = false;
    };
  }, []);

  const provider = useMemo(
    () => (providerConfig ? createFlightProvider(providerConfig) : null),
    [providerConfig]
  );

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {provider ? (
        <MapView provider={provider} />
      ) : (
        <div style={{ padding: 16 }}>Loading provider configuration...</div>
      )}
    </div>
  );
}
