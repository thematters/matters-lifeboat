import { MattersClient, DEFAULT_ENDPOINT } from "@matters/lifeboat-core";

/**
 * Resolve which GraphQL endpoint the browser should hit.
 *
 * - Production: goes through our Cloudflare Worker proxy (required, CORS).
 * - Development: if running on localhost, still use the worker if reachable,
 *   otherwise we fall back to the official endpoint (which only works from
 *   an approved origin — the user will see the CORS error and know to deploy
 *   the worker).
 */
export function getEndpoint(): string {
  const env = (import.meta as any).env ?? {};
  const override = env.VITE_MATTERS_ENDPOINT as string | undefined;
  if (override) return override;
  // Dev: use vite's server-side proxy (no CORS concerns, rewrites Origin).
  if (env.DEV) return "/api/graphql";
  // Prod: CF Worker proxy.
  return "https://matters-lifeboat-proxy.mashbean.workers.dev/";
}

export function makeClient() {
  return new MattersClient({ endpoint: getEndpoint() });
}

export function unofficialNote(endpoint: string): string {
  if (endpoint === DEFAULT_ENDPOINT) {
    return "(直接打官方 endpoint — 瀏覽器會 CORS block)";
  }
  try {
    return `(經由代理：${new URL(endpoint, typeof location !== "undefined" ? location.href : "http://localhost").host}，瀏覽器端安全)`;
  } catch {
    return `(經由代理：${endpoint}，瀏覽器端安全)`;
  }
}
