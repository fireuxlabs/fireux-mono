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
  message = 'Sign in before continuing.'
) {
  const decoded = await getAuth(getAdminApp()).verifyIdToken(
    requireBearerToken(event, message)
  )

  return {
    uid: requirePathSegment(decoded.uid, 'User id'),
    decoded,
  }
}
