import { useEffect, useState } from 'react';
import type { FlightDetails, FlightDetailsProvider } from './types';

export function useFlightDetails(
  icao24: string | null,
  provider: FlightDetailsProvider
) {
  const [details, setDetails] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!icao24) {
      setDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    provider
      .getFlightDetails(icao24)
      .then((result) => {
        if (cancelled) return;
        setDetails(result);
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
  }, [icao24, provider]);

  return { details, loading, error };
}
