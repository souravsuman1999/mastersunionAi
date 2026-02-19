/**
 * Version API base URL. Default: http://localhost:32000
 * Override with NEXT_PUBLIC_VERSION_API_URL in .env
 */
const DEFAULT_BASE = "http://localhost:32000"

export function getVersionApiBase(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_VERSION_API_URL ?? DEFAULT_BASE
  }
  return process.env.NEXT_PUBLIC_VERSION_API_URL ?? DEFAULT_BASE
}

export function versionApiUrl(path: string): string {
  const base = getVersionApiBase().replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return base ? `${base}${p}` : p
}
