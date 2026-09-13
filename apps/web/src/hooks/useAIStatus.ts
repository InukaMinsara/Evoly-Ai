import { useEffect, useState, useCallback } from 'react';
import { aiApiClient } from '../lib/api-client';

export interface AIStatus {
  status: 'configured' | 'not_configured' | 'error' | 'loading';
  model?: string;
  message?: string;
}

export function useAIStatus(): AIStatus {
  const [status, setStatus] = useState<AIStatus>({ status: 'loading' });

  const fetchStatus = useCallback(async () => {
    try {
      const data = await aiApiClient.getStatus();
      setStatus({
        status: data.status as 'configured' | 'not_configured' | 'error',
        model: data.model,
        message: data.message,
      });
    } catch {
      setStatus({ status: 'error', message: 'Could not reach API.' });
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return status;
}
