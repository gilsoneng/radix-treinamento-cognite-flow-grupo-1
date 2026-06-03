import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** App root: ipaper-checklist-management/ */
export const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const REQUIRED = [
  'CDF_PROJECT',
  'IDP_CLIENT_ID',
  'IDP_CLIENT_SECRET',
  'IDP_TOKEN_URL',
  'IDP_SCOPES',
];

/**
 * Loads `.env` from the app root. Never logs secret values.
 * @returns {Record<string, string>}
 */
export function loadEnv() {
  const envPath = resolve(APP_ROOT, '.env');
  if (!existsSync(envPath)) {
    throw new Error(
      'Missing .env. Copy .env_example to .env and set IDP_CLIENT_ID and IDP_CLIENT_SECRET.',
    );
  }

  const env = parseDotEnv(readFileSync(envPath, 'utf8'));
  applyDefaults(env);

  const missing = REQUIRED.filter((key) => !env[key]?.length);
  if (missing.length > 0) {
    throw new Error(`Missing required .env keys: ${missing.join(', ')}. See .env_example.`);
  }

  return env;
}

/**
 * @param {string} raw
 * @returns {Record<string, string>}
 */
function parseDotEnv(raw) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/**
 * @param {Record<string, string>} env
 */
function applyDefaults(env) {
  if (!env.CDF_URL && env.CDF_CLUSTER) {
    env.CDF_URL = `https://${env.CDF_CLUSTER}.cognitedata.com`;
  }
  if (!env.IDP_SCOPES && env.CDF_URL) {
    env.IDP_SCOPES = `${env.CDF_URL}/.default`;
  }
  if (!env.IDP_TOKEN_URL && env.IDP_TENANT_ID) {
    env.IDP_TOKEN_URL = `https://login.microsoftonline.com/${env.IDP_TENANT_ID}/oauth2/v2.0/token`;
  }
}
