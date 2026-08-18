// Concurrent edit — 2026-07-20 13:08 CEST — Driver kitchen access: bind grant and revoke to verified auth and runtime App identity.

import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  isDriverKitchenAccessRelation,
  type DriverKitchenAccessInput,
} from '../../../../models/driver/kitchen-access.ts'
import { mutateDriverKitchenAccess } from '../../../../server/driver/access.ts'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = requireFirestoreDocumentId(
    runtime.public?.fireux?.id,
    'Runtime App id'
  )
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  if (!databaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime App database identity is not configured.',
    })
  }

  const body = await readBody<Partial<DriverKitchenAccessInput>>(event)
  const action = body?.action
  if (action !== 'grant' && action !== 'revoke') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Driver Kitchen action must be grant or revoke.',
    })
  }
  if (body?.relation != null && !isDriverKitchenAccessRelation(body.relation)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Driver Kitchen relation is invalid.',
    })
  }

  return mutateDriverKitchenAccess({
    actorUid: uid,
    appId,
    databaseId,
    input: {
      action,
      driver_id: requireFirestoreDocumentId(body?.driver_id, 'Driver id'),
      kitchen_id: requireFirestoreDocumentId(body?.kitchen_id, 'Kitchen id'),
      ...(body?.relation ? { relation: body.relation } : {}),
    },
  })
})
