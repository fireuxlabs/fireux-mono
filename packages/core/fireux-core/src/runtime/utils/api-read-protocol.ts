export const API_READ_ENDPOINT = '/api/live'
export const API_READ_ACCESS_HEADER = 'x-fireux-live'
export const API_READ_VERSION_HEADER = 'x-fireux-live-version'
export const API_READ_MAX_CHANNELS = 32
export const API_READ_MAX_BODY_BYTES = 65_536

export type ApiReadAccess = 'public' | 'protected'

export type ApiReadSubscription = {
  id: string
  url: string
  version: string
  language?: string
}

export type ApiReadEvent =
  | { type: 'ready' | 'change'; id: string; version: string }
  | {
      type: 'error'
      id: string
      statusCode: number
      message: string
      retryable: boolean
    }
  | { type: 'reauth' }
  | { type: 'ping' }

/** A live subscription can invoke only an ordinary same-origin API GET. */
export function apiReadUrl(value: string, origin = 'http://fireux.local') {
  if (!value || value.length > 4096 || /[\u0000-\u0020\\]/.test(value))
    throw new Error('Invalid API read URL.')
  const base = new URL(origin)
  const url = new URL(value, base)
  if (
    url.origin !== base.origin ||
    !url.pathname.includes('/api/') ||
    url.pathname.endsWith(API_READ_ENDPOINT) ||
    url.username ||
    url.password ||
    url.hash ||
    /%2f|%5c/i.test(url.pathname)
  )
    throw new Error('Live reads require a same-origin API GET.')
  return `${url.pathname}${url.search}`
}

export function apiReadVersion(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{64}$/.test(value)
}

export function parseApiReadEvent(value: unknown): ApiReadEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid live read message.')
  const message = value as Record<string, unknown>
  if (message.type === 'ping') return { type: 'ping' }
  if (message.type === 'reauth') return { type: 'reauth' }
  if (typeof message.id !== 'string' || !/^[\w-]{1,64}$/.test(message.id))
    throw new Error('Invalid live read channel.')
  if (
    (message.type === 'ready' || message.type === 'change') &&
    apiReadVersion(message.version)
  )
    return { type: message.type, id: message.id, version: message.version }
  if (
    message.type === 'error' &&
    Number.isInteger(message.statusCode) &&
    Number(message.statusCode) >= 400 &&
    Number(message.statusCode) <= 599 &&
    typeof message.message === 'string' &&
    message.message.length <= 240 &&
    typeof message.retryable === 'boolean'
  )
    return {
      type: 'error',
      id: message.id,
      statusCode: Number(message.statusCode),
      message: message.message,
      retryable: message.retryable,
    }
  throw new Error('Invalid live read message.')
}
