import { CogniteClient } from '@cognite/sdk';

import { loadEnv } from './load-env.mjs';
import { createOidcTokenProvider } from './token.mjs';

/** @type {CogniteClient | null} */
let clientSingleton = null;

/** @returns {CogniteClient} */
export function getCdfClient() {
  if (!clientSingleton) {
    const env = loadEnv();
    clientSingleton = new CogniteClient({
      appId: 'ipaper-checklist-management-mcp',
      project: env.CDF_PROJECT,
      baseUrl: env.CDF_URL,
      oidcTokenProvider: createOidcTokenProvider(env),
    });
  }
  return clientSingleton;
}
