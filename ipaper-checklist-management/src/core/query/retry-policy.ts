export const MAX_QUERY_RETRIES = 3;

const MAX_BACKOFF_MS = 30_000;


export function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  if ('status' in error && typeof error.status === 'number') return error.status;
  if ('statusCode' in error && typeof error.statusCode === 'number') return error.statusCode;

  return undefined;
}


export function shouldRetryQuery(failureCount: number, error?: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;

  const status = error !== undefined ? getHttpStatus(error) : undefined;
  if (status !== undefined) {
    if (status === 429) return true;
    if (status >= 400 && status < 500) return false;
  }

  return true;
}


export function backoffWithJitter(attempt: number, random: () => number = Math.random): number {
  const base = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
  const jitter = base * 0.25 * random();
  return Math.round(base + jitter);
}
