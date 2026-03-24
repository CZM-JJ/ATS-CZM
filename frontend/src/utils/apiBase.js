const explicitApiBase = import.meta.env.VITE_API_BASE_URL

export function getApiBase() {
  if (explicitApiBase && explicitApiBase.trim()) {
    return explicitApiBase.trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:8000`
  }

  return 'http://localhost:8000'
}

export const apiBase = getApiBase()