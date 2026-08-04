import { createHash } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { ProjectUserJoinStorage } from 'fireux-core/runtime/models/operations/project-user-join.model.ts'
import { requireBearerToken } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  ServiceAccountOidcError,
  verifyServiceAccountOidc,
} from 'fireux-core/runtime/server/utils/auth/service-account-oidc.ts'
import {
  parseProjectUserJoinPublicationV1,
  ProjectUserJoinValidationError,
} from 'fireux-core/runtime/server/utils/project-user-join/validate.ts'
import { getFirestoreDb } from '../../../../utils/firebase-admin'
import {
  getSignupMonitorReceiverConfig,
  sourceScopeAllows,
} from '../../../../utils/signup-monitor/config'

const MAX_BODY_BYTES = 8 * 1024

function recordId(
  serviceAccountEmail: string,
  source: {
    firebase_project_id: string
    database_id: string
    app_id: string
  },
  eventId: string
) {
  return createHash('sha256')
    .update(serviceAccountEmail)
    .update('\0')
    .update(source.firebase_project_id)
    .update('\0')
    .update(source.database_id)
    .update('\0')
    .update(source.app_id)
    .update('\0')
    .update(eventId)
    .digest('hex')
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const config = getSignupMonitorReceiverConfig()
  if (!config.enabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  if (!config.audience || !config.sources.length) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Signup monitoring is unavailable.',
    })
  }

  const token = requireBearerToken(
    event,
    'Signup monitor publisher authentication is required.'
  )
  let principal
  try {
    principal = await verifyServiceAccountOidc(token, config.audience)
  } catch (error) {
    if (error instanceof ServiceAccountOidcError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Signup monitor publisher authentication failed.',
      })
    }
    throw error
  }

  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Signup monitor publication is too large.',
    })
  }
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    throw createError({
      statusCode: rawBody ? 413 : 400,
      statusMessage: rawBody
        ? 'Signup monitor publication is too large.'
        : 'Signup monitor publication is required.',
    })
  }

  let publication
  try {
    publication = parseProjectUserJoinPublicationV1(JSON.parse(rawBody))
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error instanceof ProjectUserJoinValidationError
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Signup monitor publication is invalid.',
      })
    }
    throw error
  }

  const source = publication.source
  const authorized = config.sources.some((scope) =>
    sourceScopeAllows(scope, {
      serviceAccountEmail: principal.service_account_email,
      firebaseProjectId: source.firebase_project_id,
      databaseId: source.database_id,
      projectId: source.project_id,
      ecosystemId: source.ecosystem_id,
      appId: source.app_id,
    })
  )
  if (!authorized) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Signup monitor publication is not authorized.',
    })
  }

  const db = await getFirestoreDb(ProjectUserJoinStorage.database)
  const ref = db
    .collection(ProjectUserJoinStorage.collection)
    .doc(ProjectUserJoinStorage.document)
  const itemId = recordId(
    principal.service_account_email,
    publication.source,
    publication.event_id
  )
  const created = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    const current = snapshot.exists
      ? (snapshot.data() as Record<string, unknown>)
      : null
    if (current && (current.version !== 1 || !Array.isArray(current.items))) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Signup monitoring is unavailable.',
      })
    }
    const items = (current?.items || []) as Array<Record<string, unknown>>
    if (items.some((item) => item?.id === itemId)) return false

    transaction.set(ref, {
      version: 1,
      items: [
        {
          id: itemId,
          version: 1,
          event_id: publication.event_id,
          source: publication.source,
          user_id: publication.user_id,
          membership_role: publication.membership_role,
          occurred_at: Timestamp.fromDate(new Date(publication.occurred_at)),
          received_at: Timestamp.now(),
        },
        ...items,
      ].slice(0, ProjectUserJoinStorage.maxItems),
      updated_at: Timestamp.now(),
    })
    return true
  })

  return {
    ok: true as const,
    outcome: created ? ('created' as const) : ('duplicate' as const),
  }
})
