import {
  createError,
  getHeader,
  readRawBody,
  setResponseHeader,
  type H3Event,
} from 'h3'
import { equalSecret, signature, ConnectionError } from './protocol'

export function protectConnectionResponse(event: H3Event) {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Referrer-Policy', 'no-referrer')
}
export function requireConnectionOrigin(event: H3Event, origin: string) {
  protectConnectionResponse(event)
  if (getHeader(event, 'origin') !== origin)
    throw new ConnectionError(403, 'Please continue from the account page.')
}
export async function peerBody(event: H3Event, secret: string) {
  protectConnectionResponse(event)
  const raw = (await readRawBody(event)) || ''
  const timestamp = getHeader(event, 'x-fireux-time') || ''
  const proof = getHeader(event, 'x-fireux-proof') || ''
  if (
    raw.length > 4096 ||
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(Date.now() - Number(timestamp)) > 60000 ||
    !equalSecret(signature(secret, `${timestamp}.${raw}`), proof)
  )
    throw new ConnectionError(403, 'Account connection could not be verified.')
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new ConnectionError(400, 'Invalid connection request.')
  }
}
export async function callConnectionPeer<T>(
  origin: string,
  secret: string,
  body: Record<string, unknown>
): Promise<T> {
  const timestamp = String(Date.now())
  const raw = JSON.stringify(body)
  try {
    return (await $fetch<T>(`${origin}/api/account/connection-peer`, {
      method: 'POST',
      body: raw,
      timeout: 10000,
      headers: {
        'content-type': 'application/json',
        'x-fireux-time': timestamp,
        'x-fireux-proof': signature(secret, `${timestamp}.${raw}`),
      },
    })) as T
  } catch (error) {
    const response = error as {
      statusCode?: number
      data?: { statusMessage?: string }
    }
    const status = Number(response.statusCode)
    if ([400, 401, 403, 404, 409, 410].includes(status))
      throw new ConnectionError(
        status,
        String(
          response.data?.statusMessage ||
            'The account connection could not continue. Start again.'
        ).slice(0, 300)
      )
    throw new ConnectionError(
      503,
      'Account connections could not be reached. Try again shortly.'
    )
  }
}
export async function connectionBoundary<T>(work: () => Promise<T>) {
  try {
    return await work()
  } catch (error) {
    if (error instanceof ConnectionError)
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    const status = Number((error as { statusCode?: number })?.statusCode)
    if ([400, 401, 403, 404, 409, 410].includes(status)) throw error
    throw createError({
      statusCode: 503,
      statusMessage:
        'Account connections could not be reached. Try again shortly.',
    })
  }
}
