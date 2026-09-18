import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenIntegrationsTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireKitchenWriterAccount } from '../core/operator-access'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import {
  normalizeAllowedWebsites,
  readAllowedWebsites,
} from '../../utils/allowed-websites'

export async function readKitchenAllowedWebsites(kitchenIdValue: unknown) {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const snapshot = await getRuntimeFirestore()
    .doc(`kitchens/${kitchenId}/integrations/website-ordering`)
    .get()
  return readAllowedWebsites(snapshot.exists ? snapshot.data() : undefined)
}

export async function readWorkspaceKitchenAllowedWebsites(
  event: H3Event,
  kitchenIdValue: unknown
) {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  await requireKitchenWriterAccount(
    { appId: actor.runtimeAppId, kitchenId },
    actor.uid
  )
  return {
    kitchenId,
    allowed_origins: await readKitchenAllowedWebsites(kitchenId),
  }
}

export async function updateKitchenAllowedWebsites(
  event: H3Event,
  input: unknown
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid website settings.',
    })
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some(
      (key) => !['kitchenId', 'allowed_origins'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported website setting.',
    })
  const kitchenId = requireFirestoreDocumentId(body.kitchenId, 'Kitchen id')
  let allowed_origins: string[]
  try {
    allowed_origins = normalizeAllowedWebsites(
      body.allowed_origins,
      import.meta.dev
    )
  } catch (cause) {
    throw createError({
      statusCode: 400,
      statusMessage:
        cause instanceof Error ? cause.message : 'Invalid website origin.',
    })
  }
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenIntegrationsTarget(kitchenId)
    const previous = await tx.read(target, 'website-ordering')
    const settings = { allowed_origins }
    if (previous.exists) tx.update(target, 'website-ordering', settings)
    else tx.create(target, 'website-ordering', settings)
    return { ok: true, settings }
  })
}
