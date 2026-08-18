// Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: serve authenticated minimal delivery beacons.

import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { listDriverDispatches } from '../../../../server/driver/dispatch.ts'

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
  return listDriverDispatches({
    actorUid: uid,
    appId: requireFirestoreDocumentId(appId, 'Runtime App id'),
    databaseId,
  })
})
