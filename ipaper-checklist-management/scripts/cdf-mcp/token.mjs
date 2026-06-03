/**
 * OAuth2 client credentials for Azure AD / OIDC (IDP_* from .env).
 * Token fetch uses the IdP URL only; CDF API calls go through @cognite/sdk.
 *
 * @param {Record<string, string>} env
 * @returns {() => Promise<string>}
 */
export function createOidcTokenProvider(env) {
  /** @type {{ token: string; expiresAt: number } | null} */
  let cache = null;

  return async function oidcTokenProvider() {
    const now = Date.now();
    if (cache && cache.expiresAt > now + 30_000) {
      return cache.token;
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.IDP_CLIENT_ID,
      client_secret: env.IDP_CLIENT_SECRET,
      scope: env.IDP_SCOPES,
    });
    if (env.IDP_AUDIENCE) {
      body.set('audience', env.IDP_AUDIENCE);
    }

    const response = await fetch(env.IDP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `OAuth token request failed (HTTP ${response.status}). Verify IDP_CLIENT_ID, IDP_CLIENT_SECRET, IDP_TOKEN_URL, and IDP_SCOPES in .env.`,
      );
    }

    const json = await response.json();
    const token = json.access_token;
    if (!token || typeof token !== 'string') {
      throw new Error('OAuth response did not include access_token.');
    }

    const expiresIn = Number(json.expires_in) || 3600;
    cache = { token, expiresAt: now + expiresIn * 1000 };
    return token;
  };
}
