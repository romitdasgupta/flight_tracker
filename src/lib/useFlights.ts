import { useEffect, useMemo, useState } from 'react';
import type { Bbox, FlightState } from './types';
import type { FlightProvider } from './flightProviders';

type UseFlightsOptions = {
  bbox: Bbox | null;
  provider: FlightProvider | null;
};

export function useFlights({ bbox, provider }: UseFlightsOptions) {
  const client = useMemo(() => provider, [provider]);
  const [flights, setFlights] = useState<FlightState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!bbox || !client) {
      setFlights([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    client
      .getStates(bbox)
      .then((data) => {
        if (cancelled) return;
        setFlights(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Surface API failures for local debugging.
        console.error(`${client.name} API request failed`, err);
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bbox, client]);

  return { flights, loading, error };
}
