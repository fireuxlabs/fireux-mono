// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: expose bounded private request data to FireUX App admins.
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { ConversationStorage } from 'fireux-core/runtime/models/operations/conversation.model'
import { serializeIgnitionRequest } from '../../../utils/ignition-request'
import { requireFireuxAppAdmin } from '../../../utils/require-fireux-app-admin'

export default defineEventHandler(async (event: H3Event) => {
  const { appId, db } = await requireFireuxAppAdmin(event)
  const snapshot = await db
    .collection(AppStorage.collection)
    .doc(appId)
    .collection(ConversationStorage.collection)
    .where('kind', '==', 'ignition')
    .limit(50)
    .get()
  const items = snapshot.docs
    .map((document) =>
      serializeIgnitionRequest(
        document.id,
        (document.data() || {}) as Record<string, unknown>
      )
    )
    .sort((left, right) => right.created_at.localeCompare(left.created_at))

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    items,
  }
})
