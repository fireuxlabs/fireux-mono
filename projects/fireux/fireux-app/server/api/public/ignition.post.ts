// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: capture public requests and notify the FireUX App owner.
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
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import {
  UserAppStorage,
  UserNotificationStorage,
  UserStorage,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { getFirestoreDb } from '../../utils/firebase-admin'
import {
  emptyIgnitionChecklist,
  IgnitionRequestStorage,
  parsePublicIgnitionRequest,
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
    .collection(UserAppStorage.collection)
    .where('role', '==', 'admin')
    .limit(16)
    .get()
  const userIds = new Set(
    memberships.docs.map((document) => document.id.trim()).filter(Boolean)
  )
  if (!userIds.size && input.developerId) userIds.add(input.developerId)
  if (!userIds.size) return

  const batch = db.batch()
  for (const userId of userIds) {
    const notificationRef = db
      .collection(UserStorage.rootCollection)
      .doc(userId)
      .collection(UserNotificationStorage.collection)
      .doc(`ignition-${input.requestId}`)
    batch.set(notificationRef, {
      message: `New Ignition request from ${input.businessName}.`,
      scope: 'app',
      created: {
        at: input.timestamp,
        app_id: input.appId,
      },
      read: false,
    })
  }
  await batch.commit()
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

  const input = parsePublicIgnitionRequest(await readJsonBody(event))
  const timestamp = Timestamp.now()
  const db = await getFirestoreDb()
  const requestRef = db
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(IgnitionRequestStorage.collection)
    .doc()

  try {
    await requestRef.create({
      schema_version: 1,
      app_id: appId,
      source: 'fireux-app/get-started',
      status: 'new',
      contact: {
        name: input.contactName,
        email: input.contactEmail,
      },
      business: {
        name: input.businessName,
        website: input.website,
        branding: input.branding,
      },
      pages: input.pages,
      app_job: input.appJob,
      access: input.access,
      delivery: emptyIgnitionChecklist(),
      created: {
        at: timestamp,
        app_id: appId,
      },
      updated: {
        at: timestamp,
      },
    })
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
      requestId: requestRef.id,
      timestamp,
    })
  } catch (error) {
    console.warn(
      `[ignition] owner notification failed for ${requestRef.id}:`,
      error
    )
  }

  setResponseStatus(event, 201)
  return {
    ok: true as const,
    reference: requestRef.id,
  }
})
