export function resolveRedirectParam(
  value: string | null | undefined,
  fallback: string = "/dashboard"
): string {
  if (!value) return fallback;

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/")) {
      return fallback;
    }

    if (decoded.startsWith("//")) {
      return fallback;
    }

    // Validate using URL to ensure it's a proper path
    new URL(decoded, "https://example.com");

    return decoded;
  } catch (_error) {
    return fallback;
  }
}

export function appendQueryParam(
  url: string,
  key: string,
  value: string | null | undefined
): string {
  if (!value) return url;

  const destination = new URL(url, "https://example.com");
  destination.searchParams.set(key, value);
  return destination.pathname + destination.search + destination.hash;
}
