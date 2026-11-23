import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
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

function request(
  value: unknown,
  runtimeReservedRouteKeys: readonly unknown[],
  identityOnly: boolean
) {
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
    patch: parseKitchenUpdate(
      source.patch,
      runtimeReservedRouteKeys,
      identityOnly
    ),
  }
}

export async function updateKitchen(event: H3Event, input: unknown) {
  const runtime = useRuntimeConfig(event)
  const keys = runtime.public?.fireux?.reservedRouteKeys
  const requested = request(
    input,
    Array.isArray(keys) ? keys : [],
    runtime.kitchensWorkspaceOnly === true
  )
  const actor = await readKitchenMutationActor(event)
  const slug = requested.patch.slug ?? requested.patch['identity.slug']
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const current = await requireKitchenRecordMutationAuthority(
      mutations,
      actor,
      requested.kitchenId
    )
    if ('identity.name' in requested.patch) {
      const identity = record(current.rootData.identity)
      if (identity?.source !== 'user' || typeof identity.name !== 'string') {
        throw createError({
          statusCode: 409,
          statusMessage: 'This Kitchen’s name is managed by its Place.',
        })
      }
    }
    if (typeof slug === 'string') {
      const matches = await Promise.all(
        ['slug', 'identity.slug'].map((field) =>
          mutations.query(KITCHEN_MUTATION_TARGETS.kitchens, {
            field,
            op: '==',
            value: slug,
            limit: 2,
          })
        )
      )
      if (matches.flat().some((match) => match.id !== requested.kitchenId)) {
        throw createError({
          statusCode: 409,
          statusMessage: `Kitchen slug "${slug}" is already taken.`,
        })
      }
    }
    const { patch } = requested
    if (typeof patch.placeId === 'string') {
      const place = await mutations.read(
        PLACE_MUTATION_TARGETS.places,
        patch.placeId
      )
      if (!place.exists) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Place not found.',
        })
      }
    }
    const listingChanged = ['slug', 'status', 'visibility'].some(
      (field) => field in patch
    )
    const listing = { ...current.rootData, ...patch }
    if (
      listingChanged &&
      listing.status === 'active' &&
      (listing.visibility === 'public' || listing.visibility === 'unlisted') &&
      (typeof listing.slug !== 'string' || !listing.slug.trim())
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Set a slug before making the Kitchen public or unlisted.',
      })
    }
    for (const field of ['slug', 'description', 'imageUrl']) {
      if (patch[field] === null) patch[field] = FieldValue.delete()
    }
    mutations.update<DocumentData>(
      KITCHEN_MUTATION_TARGETS.kitchens,
      requested.kitchenId,
      {
        ...patch,
        updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
      }
    )
  })
  return { ok: true as const, kitchen_id: requested.kitchenId }
}
