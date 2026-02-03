import { useEffect, useMemo, useState } from 'react';
import type { Bbox, FlightState } from './types';
import { createOpenSkyClient } from './opensky';

type UseOpenSkyFlightsOptions = {
  bbox: Bbox | null;
  baseUrl?: string;
};

export function useOpenSkyFlights({ bbox, baseUrl }: UseOpenSkyFlightsOptions) {
  const client = useMemo(() => createOpenSkyClient({ baseUrl }), [baseUrl]);
  const [flights, setFlights] = useState<FlightState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!bbox) {
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
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bbox, client]);

  return { flights, loading, error };
}
