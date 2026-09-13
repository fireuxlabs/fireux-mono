import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

// Existing Kitchen → Place integration: read the domain grant without importing Kitchens.
export function placeKitchenAccessTarget(appId: string) {
  return defineFirestoreMutationTarget({
    key: 'places.kitchen-access',
    lane: 'server',
    verbs: ['update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchen_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`,
  })
}

export function canKitchenEditPlace(input: {
  uid: string
  placeId: string
  kitchenId: string
  appId: string
  runtimeAppId: string
  kitchenExists: boolean
  membershipExists: boolean
  access: unknown
  membership: Record<string, unknown>
}) {
  return Boolean(
    input.uid &&
      input.appId &&
      input.appId === input.runtimeAppId &&
      input.kitchenId === input.placeId &&
      input.kitchenExists &&
      input.membershipExists &&
      ['user', 'admin', 'dev'].includes(String(input.membership.role)) &&
      isAppUserSubscription(input.membership.subscription) &&
      readMembershipAccessIds(input.access, input.membership).includes(
        input.kitchenId
      )
  )
}
