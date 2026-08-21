// Origin-aware Ignition intake creates an App-owned Conversation.
import { randomUUID } from 'node:crypto'
import { useRuntimeConfig } from '#imports'
import { Timestamp } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  setResponseHeaders,
  setResponseStatus,
  type H3Event,
} from 'h3'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { AppUserStorage } from 'fireux-core/runtime/user/models/user.model'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverAppConversationsTarget,
  serverConversationMessagesTarget,
  serverIdentityUserNotificationsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getFirestoreDb } from '../../utils/firebase-admin'
import {
  emptyIgnitionChecklist,
  parseIgnitionConversationInput,
} from '../../utils/ignition-request'

const MAX_BODY_BYTES = 32 * 1024

async function readJsonBody(event: H3Event) {
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'The Ignition request is too large.',
    })
  }

  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    throw createError({
      statusCode: rawBody ? 413 : 400,
      statusMessage: rawBody
        ? 'The Ignition request is too large.'
        : 'Complete the Ignition form before sending it.',
    })
  }

  try {
    return JSON.parse(rawBody) as unknown
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'The Ignition request is invalid.',
    })
  }
}

async function publishOwnerNotifications(input: {
  appId: string
  businessName: string
  developerId: string
  requestId: string
  timestamp: Timestamp
}) {
  const db = await getFirestoreDb()
  const memberships = await db
    .collection(AppStorage.collection)
    .doc(input.appId)
    .collection(AppUserStorage.collection)
    .where('role', '==', 'admin')
    .limit(16)
    .get()
  const userIds = new Set(
    memberships.docs.map((document) => document.id.trim()).filter(Boolean)
  )
  if (!userIds.size && input.developerId) userIds.add(input.developerId)
  if (!userIds.size) return

  await runGuardedServerTransaction({ kind: 'identity' }, async (mutations) => {
    for (const userId of userIds) {
      const notifications = serverIdentityUserNotificationsTarget(userId)
      const id = `ignition-${input.requestId}`
      const existing = await mutations.read(notifications, id)
      const notification = {
        message: `New Ignition request from ${input.businessName}.`,
        scope: 'app',
        created: {
          at: input.timestamp,
          app_id: input.appId,
        },
        read: false,
      }
      if (existing.exists) mutations.update(notifications, id, notification)
      else mutations.create(notifications, id, notification)
    }
  })
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const runtime = useRuntimeConfig(event)
  const appId = String(runtime.public?.fireux?.id || '').trim()
  if (!appId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Ignition is unavailable right now.',
    })
  }

  const input = parseIgnitionConversationInput(await readJsonBody(event))
  const timestamp = Timestamp.now()
  const requestId = randomUUID()
  const messageId = randomUUID()
  const expiresAt = Timestamp.fromMillis(
    timestamp.toMillis() + 365 * 24 * 60 * 60 * 1000
  )

  try {
    await runGuardedServerTransaction(
      { kind: 'runtime' },
      async (mutations) => {
        mutations.create(serverAppConversationsTarget(appId), requestId, {
          app_id: appId,
          kind: 'ignition',
          status: 'open',
          related_entity: {
            family: 'apps',
            id: appId,
            path: `apps/${appId}`,
            label: input.businessName,
          },
          participant_ids: [],
          guest_contact: {
            name: input.contactName,
            email: input.contactEmail,
            phone: '',
            company: input.businessName,
            preferred_channel: 'email',
          },
          source_route: '/get-started',
          expires_at: expiresAt,
          last_message: {
            body: input.appJob,
            sender_id: '',
            sender_type: 'guest',
            sender_name: input.contactName,
            created_at: timestamp,
          },
          ignition: {
            stage: 'new',
            website: input.website,
            branding: input.branding,
            pages: input.pages,
            app_job: input.appJob,
            access: input.access,
            origin: input.origin,
            delivery: emptyIgnitionChecklist(),
          },
          created: { at: timestamp, app_id: appId },
          updated: { at: timestamp },
        })
        mutations.create(
          serverConversationMessagesTarget(appId, requestId),
          messageId,
          {
            conversation_id: requestId,
            sender_id: '',
            sender_type: 'guest',
            sender_name: input.contactName,
            body: input.appJob,
            read_by: [],
            created: { at: timestamp, app_id: appId },
            updated: { at: timestamp },
          }
        )
      }
    )
  } catch (error) {
    console.error('[ignition] request storage failed:', error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Your request could not be saved. Please try again.',
    })
  }

  try {
    await publishOwnerNotifications({
      appId,
      businessName: input.businessName,
      developerId: String(runtime.public?.fireux?.developerId || '').trim(),
      requestId,
      timestamp,
    })
  } catch (error) {
    console.warn(
      `[ignition] owner notification failed for ${requestId}:`,
      error
    )
  }

  setResponseStatus(event, 201)
  return {
    ok: true as const,
    reference: requestId,
  }
})
