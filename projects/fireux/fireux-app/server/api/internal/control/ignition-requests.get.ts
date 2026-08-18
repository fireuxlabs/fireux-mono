// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: expose bounded private request data to FireUX App admins.
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  IgnitionRequestStorage,
  serializeIgnitionRequest,
} from '../../../utils/ignition-request'
import { requireFireuxAppAdmin } from '../../../utils/require-fireux-app-admin'

export default defineEventHandler(async (event: H3Event) => {
  const { appId, db } = await requireFireuxAppAdmin(event)
  const snapshot = await db
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(IgnitionRequestStorage.collection)
    .orderBy('created.at', 'desc')
    .limit(50)
    .get()
  const items = snapshot.docs.map((document) =>
    serializeIgnitionRequest(
      document.id,
      (document.data() || {}) as Record<string, unknown>
    )
  )

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    items,
  }
})
