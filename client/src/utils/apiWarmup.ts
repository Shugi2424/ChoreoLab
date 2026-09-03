const DEFAULT_GRAPHQL_URL = "http://localhost:4000/graphql";

export function getApiHealthUrl(graphqlUrl = import.meta.env.VITE_GRAPHQL_URL): string {
  const resolved = graphqlUrl?.trim() || DEFAULT_GRAPHQL_URL;
  return resolved.replace(/\/graphql\/?$/, "/health");
}

/** Wake a sleeping hosted API (e.g. Render) before auth requests. Fire-and-forget. */
export function warmApiConnection(): void {
  const healthUrl = getApiHealthUrl();
  void fetch(healthUrl, { method: "GET", mode: "cors" }).catch(() => {
    // Ignore — login will surface connectivity errors if the API is down.
  });
}
