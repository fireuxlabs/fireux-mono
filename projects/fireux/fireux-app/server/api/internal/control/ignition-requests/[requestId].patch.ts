// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: let FireUX App admins accept requests and run their delivery checklist.
import { Timestamp } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  IgnitionRequestStorage,
  parseIgnitionRequestPatch,
  serializeIgnitionRequest,
} from '../../../../utils/ignition-request'
import { requireFireuxAppAdmin } from '../../../../utils/require-fireux-app-admin'

export default defineEventHandler(async (event: H3Event) => {
  const { appId, db, uid } = await requireFireuxAppAdmin(event)
  const requestId = requireFirestoreDocumentId(
    getRouterParam(event, 'requestId'),
    'Ignition request id'
  )
  const patch = parseIgnitionRequestPatch(await readBody(event))
  const requestRef = db
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(IgnitionRequestStorage.collection)
    .doc(requestId)

  const updated = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef)
    if (!snapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ignition request not found.',
      })
    }

    const source = (snapshot.data() || {}) as Record<string, unknown>
    const currentStatus = String(source.status || '').trim()
    const timestamp = Timestamp.now()
    const updates: Record<string, unknown> = {
      updated: { at: timestamp, by: uid },
    }

    if (patch.kind === 'status') {
      updates.status = patch.status
      if (patch.status === 'accepted' && currentStatus !== 'accepted') {
        updates.accepted = { at: timestamp, by: uid }
      }
      if (patch.status === 'launched') {
        updates['delivery.launched'] = true
      }
    } else {
      if (currentStatus === 'new' || currentStatus === 'declined') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Accept this request before starting its checklist.',
        })
      }
      updates[`delivery.${patch.key}`] = patch.value
      if (patch.key === 'launched') {
        updates.status = patch.value ? 'launched' : 'in-progress'
      } else if (currentStatus === 'accepted' && patch.value) {
        updates.status = 'in-progress'
      }
    }

    transaction.update(requestRef, updates)
    return serializeIgnitionRequest(requestId, {
      ...source,
      status: updates.status || source.status,
      delivery: {
        ...((source.delivery || {}) as Record<string, unknown>),
        ...(patch.kind === 'checklist'
          ? { [patch.key]: patch.value }
          : patch.status === 'launched'
            ? { launched: true }
            : {}),
      },
    })
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    item: updated,
  }
})
