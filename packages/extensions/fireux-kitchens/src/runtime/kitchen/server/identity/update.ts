import type { DocumentData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { KITCHEN_MUTATION_TARGETS } from '../mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority.ts'
import { parseKitchenUpdate } from './update-input.ts'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

function request(value: unknown) {
  const source = record(value)
  if (!source)
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen update request must be an object.',
    })
  const unsupported = Object.keys(source).find(
    (key) => !['kitchen_id', 'patch'].includes(key)
  )
  if (unsupported)
    throw createError({
      statusCode: 400,
      statusMessage: `Kitchen update contains unsupported request field: ${unsupported}.`,
    })
  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    patch: parseKitchenUpdate(source.patch),
  }
}

export async function updateKitchen(event: H3Event, input: unknown) {
  const requested = request(input)
  const actor = await readKitchenMutationActor(event)
  const slug =
    typeof requested.patch['identity.slug'] === 'string'
      ? requested.patch['identity.slug']
      : ''
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const current = await requireKitchenRecordMutationAuthority(
      mutations,
      actor,
      requested.kitchenId
    )
    if (slug) {
      const matches = await mutations.query(KITCHEN_MUTATION_TARGETS.kitchens, {
        field: 'identity.slug',
        op: '==',
        value: slug,
        limit: 2,
      })
      if (matches.some((match) => match.id !== requested.kitchenId)) {
        throw createError({
          statusCode: 409,
          statusMessage: `Kitchen slug "${slug}" is already taken.`,
        })
      }
    }
    mutations.update<DocumentData>(
      KITCHEN_MUTATION_TARGETS.kitchens,
      requested.kitchenId,
      {
        ...requested.patch,
        updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
      }
    )
  })
  return { ok: true as const, kitchen_id: requested.kitchenId }
}
