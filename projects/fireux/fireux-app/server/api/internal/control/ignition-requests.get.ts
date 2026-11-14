import {
  defineEventHandler,
  setResponseHeader,
  setResponseHeaders,
  type H3Event,
} from 'h3'

// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: expose bounded private request data to FireUX App admins.

import { CONVERSATION_COLLECTION } from 'fireux-core/runtime/app/server/chat/storage'
import { serializeIgnitionRequest } from '../../../utils/ignition-request'
import { requireFireuxAppAdmin } from '../../../utils/require-fireux-app-admin'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const { appId, db } = await requireFireuxAppAdmin(event)
  const snapshot = await db
    .collection('apps')
    .doc(appId)
    .collection(CONVERSATION_COLLECTION)
    .where('kind', '==', 'ignition')
    .limit(50)
    .get()
  const originals = new Map(
    snapshot.docs.map((document) => [document.id, document.data()])
  )
  const items = snapshot.docs
    .filter((document) => !document.data()?.ignition?.forwarded_to)
    .map((document) => {
      const source = document.data() || {}
      const original = originals.get(source.ignition?.original_request_id)
      return serializeIgnitionRequest(document.id, {
        ...source,
        guest_contact: original?.guest_contact ?? source.guest_contact,
        ignition: { ...original?.ignition, ...source.ignition },
      })
    })
    .sort((left, right) => right.created_at.localeCompare(left.created_at))

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  return {
    ok: true as const,
    items,
  }
})
