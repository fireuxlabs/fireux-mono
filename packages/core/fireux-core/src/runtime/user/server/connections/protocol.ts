import {
  createHash,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from 'node:crypto'

export type ConnectionRecord = Record<string, any>
export class ConnectionError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}
export const opaque = () => randomBytes(32).toString('base64url')
export const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex')
export function requireOpaque(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value))
    throw new ConnectionError(
      400,
      'This connection link is invalid. Start again from FireUX.'
    )
  return value
}
export function equalSecret(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
export function connectionOrigin(value: unknown, development: boolean) {
  try {
    const url = new URL(String(value))
    if (
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      throw new Error()
    if (
      url.protocol !== 'https:' &&
      !(
        development &&
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1'].includes(url.hostname)
      )
    )
      throw new Error()
    return url.origin
  } catch {
    throw new ConnectionError(503, 'Account connections are not available yet.')
  }
}
export function requirePeerSecret(value: unknown) {
  if (typeof value !== 'string' || Buffer.byteLength(value) < 32)
    throw new ConnectionError(503, 'Account connections are not available yet.')
  return value
}
export const signature = (secret: string, text: string) =>
  createHmac('sha256', secret).update(text).digest('base64url')
export function sealHandoff(secret: string, value: ConnectionRecord) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${payload}.${signature(secret, payload)}`
}
export function openHandoff(
  secret: string,
  cookie: string | undefined,
  now: number
) {
  if (!cookie || cookie.length > 4000)
    throw new ConnectionError(400, 'This sign-in has expired. Start again.')
  const [payload, proof, extra] = cookie.split('.')
  if (
    extra ||
    !payload ||
    !proof ||
    !equalSecret(signature(secret, payload), proof)
  )
    throw new ConnectionError(400, 'This sign-in has expired. Start again.')
  let value: ConnectionRecord
  try {
    value = JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    throw new ConnectionError(400, 'This sign-in has expired. Start again.')
  }
  if (!Number.isFinite(value.expires) || value.expires <= now)
    throw new ConnectionError(400, 'This sign-in has expired. Start again.')
  return value
}
export function requireRecentAuth(authTime: unknown, now: number) {
  if (
    typeof authTime !== 'number' ||
    authTime * 1000 > now + 30000 ||
    now - authTime * 1000 > 5 * 60 * 1000
  )
    throw new ConnectionError(
      401,
      'Confirm your account again before continuing.'
    )
}
