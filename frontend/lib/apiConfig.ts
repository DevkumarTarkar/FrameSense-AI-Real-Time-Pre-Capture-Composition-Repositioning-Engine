/**
 * FrameSense AI - Unified Dynamic Endpoint & Protocol Resolution
 * Automatically resolves HTTPS/WSS and production domains or localhost.
 * Solves mixed-content blocking and camera security requirements across all browsers.
 */

export function getApiBaseUrl(): string {
  // 1. Explicit production environment variable takes highest priority
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
  }

  // 2. Browser runtime dynamic protocol & host resolution
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:'
    const proto = isHttps ? 'https:' : 'http:'
    const host = window.location.hostname || '127.0.0.1'

    // If deployed on standard cloud ports (80 or 443 / subdomains without explicit port)
    if (window.location.port === '' || window.location.port === '80' || window.location.port === '443') {
      return `${proto}//${host}`
    }

    // Default local developer port
    return `${proto}//${host}:8000`
  }

  return 'http://127.0.0.1:8000'
}

export function getWebSocketUrl(): string {
  // 1. Explicit production environment variable takes highest priority
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, '')
  }

  // 2. Browser runtime dynamic protocol resolution
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:'
    const wsProto = isHttps ? 'wss:' : 'ws:'
    const host = window.location.hostname || '127.0.0.1'

    if (window.location.port === '' || window.location.port === '80' || window.location.port === '443') {
      return `${wsProto}//${host}/ws/analyze`
    }

    return `${wsProto}//${host}:8000/ws/analyze`
  }

  return 'ws://127.0.0.1:8000/ws/analyze'
}
