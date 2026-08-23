// Concurrent edit — 2026-07-20 14:17 CEST — Bearer security: reject revoked or disabled Firebase sessions on trusted server routes.
import { createError, getHeader, type H3Event } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from '../getAdmin.ts'
import { requirePathSegment } from '../ids/path.ts'
import { readString } from '../records/read.ts'

export function bearerToken(value: unknown) {
  return readString(value).match(/^Bearer\s+(.+)$/i)?.[1] || ''
}

export function bearerTokenFromEvent(event: H3Event) {
  return bearerToken(getHeader(event, 'authorization'))
}

export function requireBearerToken(
  event: H3Event,
  message = 'Sign in before continuing.'
) {
  const token = bearerTokenFromEvent(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: message,
    })
  }

  return token
}

export async function requireFirebaseBearerUser(
  event: H3Event,
  message = 'Sign in before continuing.',
  options: { allowAnonymous?: boolean } = {}
) {
  const user = await firebaseBearerUser(event, options).catch(() => null)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: message,
    })
  }

  return user
}

export async function firebaseBearerUser(
  event: H3Event,
  options: { allowAnonymous?: boolean } = {}
) {
  const token = bearerTokenFromEvent(event)
  if (!token) return null

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token, true)
  if (
    decoded.firebase?.sign_in_provider === 'anonymous' &&
    options.allowAnonymous !== true
  )
    return null

  return {
    uid: requirePathSegment(decoded.uid, 'User id'),
    decoded,
  }
}
