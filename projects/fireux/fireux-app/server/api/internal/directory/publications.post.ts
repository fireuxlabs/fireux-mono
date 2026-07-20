// Concurrent edit — 2026-07-19 22:10 CEST — Directory Publication Rules Pass: pin receiver writes to the server-only platform database.
// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.

import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requireBearerToken } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  applyDirectoryPublicationTransaction,
  DirectoryPublicationAuthorizationError,
  DirectoryPublicationStateError,
} from 'fireux-core/runtime/server/utils/directory-publication/firestore.ts'
import {
  DirectoryPublisherOidcError,
  verifyDirectoryPublisherOidc,
} from 'fireux-core/runtime/server/utils/directory-publication/oidc.ts'
import {
  DirectoryPublicationValidationError,
  parseDirectoryPublicationV1,
} from 'fireux-core/runtime/server/utils/directory-publication/validate.ts'
import {
  getDirectoryPublicationReceiverConfig,
  isDirectoryPublicationDatabase,
} from '../../../utils/directory-publication/config'
import { getFirestoreDb } from '../../../utils/firebase-admin'

const MAX_BODY_BYTES = 64 * 1024

function validReceiverIdentity(audience: string, databaseId: string) {
  try {
    return (
      new URL(audience).protocol === 'https:' &&
      isDirectoryPublicationDatabase(databaseId)
    )
  } catch {
    return false
  }
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const config = getDirectoryPublicationReceiverConfig()
  if (!config.enabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  if (!validReceiverIdentity(config.audience, config.databaseId)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Directory publication is unavailable.',
    })
  }

  const token = requireBearerToken(
    event,
    'Directory publisher authentication is required.'
  )
  let principal
  try {
    principal = await verifyDirectoryPublisherOidc(token, config.audience)
  } catch (error) {
    if (error instanceof DirectoryPublisherOidcError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Directory publisher authentication failed.',
      })
    }
    throw error
  }

  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Directory publication is too large.',
    })
  }

  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    throw createError({
      statusCode: rawBody ? 413 : 400,
      statusMessage: rawBody
        ? 'Directory publication is too large.'
        : 'Directory publication is required.',
    })
  }

  let publication
  try {
    publication = parseDirectoryPublicationV1(JSON.parse(rawBody))
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error instanceof DirectoryPublicationValidationError
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Directory publication is invalid.',
      })
    }
    throw error
  }

  try {
    const db = await getFirestoreDb(config.databaseId)
    const result = await applyDirectoryPublicationTransaction({
      db,
      event: publication,
      principal,
    })
    return {
      ok: true as const,
      outcome: result.outcome,
    }
  } catch (error) {
    if (error instanceof DirectoryPublicationAuthorizationError) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Directory publication is not authorized.',
      })
    }
    if (error instanceof DirectoryPublicationStateError) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Directory publication is unavailable.',
      })
    }
    throw createError({
      statusCode: 503,
      statusMessage: 'Directory publication is unavailable.',
    })
  }
})
