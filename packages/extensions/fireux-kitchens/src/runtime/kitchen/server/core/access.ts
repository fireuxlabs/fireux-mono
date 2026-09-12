import { createError } from 'h3'
import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { kitchenAccessCollectionPath } from '../../utils/kitchen-access'
import {
  KITCHEN_USER_LIMIT,
  resolveKitchenAllowance,
} from '../../utils/kitchen-capacity'

export function serverKitchenAccessTarget(appId: string) {
  return defineFirestoreMutationTarget({
    key: 'kitchens.access',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'runtime' },
    collectionPath: kitchenAccessCollectionPath(appId),
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
