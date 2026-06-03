import { QueryClient } from '@tanstack/react-query';

import { backoffWithJitter, shouldRetryQuery } from '../../core/query/retry-policy';


export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => shouldRetryQuery(failureCount, error),
        retryDelay: (attempt) => backoffWithJitter(attempt),
      },
    },
  });
}
