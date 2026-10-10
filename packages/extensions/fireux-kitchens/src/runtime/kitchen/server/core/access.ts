import { createError } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { KITCHEN_ACCESS_COLLECTION_PATH } from '../../utils/kitchen-access.ts'
import {
  KITCHEN_USER_LIMIT,
  resolveKitchenAllowance,
} from '../../utils/kitchen-capacity.ts'

export function serverKitchenAccessTarget() {
  return defineFirestoreMutationTarget({
    key: 'kitchens.access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: KITCHEN_ACCESS_COLLECTION_PATH,
  })
}

/** Count and grant are committed alongside the Kitchen in the same transaction. */
export function resolveKitchenGrantIds(
  membership: unknown,
  currentIds: readonly string[],
  kitchenId: string
) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  if (
    !currentIds.includes(id) &&
    !resolveKitchenAllowance(membership, currentIds).hasCapacity
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your current subscription supports one Kitchen.',
    })
  }
  const ids = [...new Set([...currentIds, id])]
  if (ids.length > KITCHEN_USER_LIMIT) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User Kitchens exceed the supported limit.',
    })
  }
  return ids
}
