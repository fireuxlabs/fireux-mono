// Concurrent edit — 2026-08-23 CEST — Kitchen Workspace reset: resolve the signed-in user's active Kitchens.
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  defineGuardedServerCollectionGroupTarget,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { KITCHEN_USER_LIMIT } from '../../models/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

const kitchenTeamGroup = defineGuardedServerCollectionGroupTarget({
  key: 'kitchens.team.collection-group',
  database: { kind: 'runtime' },
  parentCollection: 'kitchens',
  collectionId: 'team',
})

export async function readOwnedKitchenIdsInTransaction(
  transaction: GuardedServerTransaction,
  uid: string
) {
  const members = await transaction.queryCollectionGroup<{
    role?: unknown
    status?: unknown
    user_id?: unknown
  }>(kitchenTeamGroup, {
    field: 'user_id',
    value: uid,
    limit: KITCHEN_USER_LIMIT + 1,
  })
  const ids = members.flatMap((member) =>
    member.id === uid &&
    text(member.data.user_id) === uid &&
    member.data.role === 'owner' &&
    member.data.status === 'active'
      ? [member.parentId]
      : []
  )
  if (ids.length > KITCHEN_USER_LIMIT) {
    conflict('Owned Kitchens exceed the supported limit.')
  }
  return ids
}

export async function readUserKitchenIds(uid: string) {
  const snapshot = await getRuntimeFirestore()
    .collectionGroup('team')
    .where('user_id', '==', uid)
    .where('status', '==', 'active')
    .get()
  const ids = [
    ...new Set(
      snapshot.docs.flatMap((member) => {
        const parts = member.ref.path.split('/')
        if (
          parts.length !== 4 ||
          parts[0] !== 'kitchens' ||
          parts[2] !== 'team' ||
          parts[3] !== uid ||
          text(member.get('user_id')) !== uid
        ) {
          return []
        }
        return [parts[1]]
      })
    ),
  ]

  if (ids.length > KITCHEN_USER_LIMIT) {
    conflict('User Kitchens exceed the supported limit.')
  }
  return ids
}
