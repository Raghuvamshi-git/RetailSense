import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for API calls.
 * @param {Function} fetchFn  – async function to call
 * @param {any[]} deps        – dependency array (re-fetches when changed)
 * @param {boolean} immediate – whether to call on mount
 */
export function useApi(fetchFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, execute };
}
