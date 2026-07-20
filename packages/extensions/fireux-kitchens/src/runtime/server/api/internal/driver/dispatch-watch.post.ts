// Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: write Driver watch state without exposing full orders.

import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type { DriverDispatchWatchInput } from '../../../../models/driver/dispatch.ts'
import { watchDriverDispatch } from '../../../../server/kitchen/driver-dispatch.ts'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = String(runtime.public?.fireux?.id || '').trim()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  if (!databaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime App database identity is not configured.',
    })
  }
  const body = await readBody<Partial<DriverDispatchWatchInput>>(event)
  return watchDriverDispatch(
    {
      actorUid: uid,
      appId: requireFirestoreDocumentId(appId, 'Runtime App id'),
      databaseId,
    },
    {
      kitchen_id: requireFirestoreDocumentId(body?.kitchen_id, 'Kitchen id'),
      order_id: requireFirestoreDocumentId(body?.order_id, 'Order id'),
    }
  )
})
