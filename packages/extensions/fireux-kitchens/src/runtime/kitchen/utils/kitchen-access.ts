import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { assertFirestoreMutationSegment } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { KITCHEN_USER_LIMIT } from './kitchen-capacity'

export function kitchenAccessCollectionPath(appId: string) {
  return `kitchen_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`
}

export function readKitchenAccessIds(value: unknown, membership: unknown) {
  const ids = readMembershipAccessIds(value, membership)
  if (ids.length > KITCHEN_USER_LIMIT) {
    throw Object.assign(
      new Error('User Kitchens exceed the supported limit.'),
      { statusCode: 409 }
    )
  }
  return ids
}
