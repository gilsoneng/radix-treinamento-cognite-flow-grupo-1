import { describe, expect, it } from 'vitest';

import { MAX_QUERY_RETRIES, backoffWithJitter, getHttpStatus, shouldRetryQuery } from './retry-policy';

describe('getHttpStatus', () => {
  it('reads status and statusCode from error objects', () => {
    expect(getHttpStatus({ status: 401 })).toBe(401);
    expect(getHttpStatus({ statusCode: 403 })).toBe(403);
    expect(getHttpStatus(new Error('boom'))).toBeUndefined();
  });
});

describe('shouldRetryQuery', () => {
  it('retries while under the bound', () => {
    expect(shouldRetryQuery(0)).toBe(true);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES - 1)).toBe(true);
  });

  it('stops at the bound', () => {
    expect(shouldRetryQuery(MAX_QUERY_RETRIES)).toBe(false);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES + 1)).toBe(false);
  });

  it('does not retry client errors except 429', () => {
    expect(shouldRetryQuery(0, { status: 401 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 403 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 400 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 429 })).toBe(true);
  });

  it('still retries server errors', () => {
    expect(shouldRetryQuery(0, { status: 500 })).toBe(true);
  });
});

describe('backoffWithJitter', () => {
  it('grows exponentially from the base (no jitter)', () => {
    const zeroJitter = () => 0;
    expect(backoffWithJitter(0, zeroJitter)).toBe(1000);
    expect(backoffWithJitter(1, zeroJitter)).toBe(2000);
    expect(backoffWithJitter(2, zeroJitter)).toBe(4000);
  });

  it('adds up to 25% jitter on top of the base', () => {
    const fullJitter = () => 1;
    expect(backoffWithJitter(0, fullJitter)).toBe(1250);
  });

  it('caps the base at 30s', () => {
    const zeroJitter = () => 0;
    expect(backoffWithJitter(20, zeroJitter)).toBe(30_000);
  });
});
