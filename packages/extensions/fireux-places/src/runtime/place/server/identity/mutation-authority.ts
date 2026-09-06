import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'

export function canKitchenEditPlace(input: {
  uid: string
  placeId: string
  kitchenId: string
  appId: string
  runtimeAppId: string
  kitchenExists: boolean
  membershipExists: boolean
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
      Array.isArray(input.membership.kitchens) &&
      input.membership.kitchens.includes(input.kitchenId)
  )
}
