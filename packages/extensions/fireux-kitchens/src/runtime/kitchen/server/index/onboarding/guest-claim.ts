import { createHash } from 'node:crypto'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fail } from './request'

export function guestKitchenClaimTarget(kitchenId: string) {
  return defineFirestoreMutationTarget({
    key: 'kitchens.guest-claim',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${requireFirestoreDocumentId(kitchenId, 'Kitchen id')}/claims`,
  })
}

export function hashGuestKitchenSecret(value: unknown) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    fail(400, 'Kitchen recovery proof is invalid.')
  return createHash('sha256').update(value).digest('hex')
}
