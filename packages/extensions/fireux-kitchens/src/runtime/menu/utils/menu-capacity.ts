import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'

// Menu records belong to a Kitchen; the actor's account subscription governs creation only.
export const kitchenMenuCapacity = {
  'kitchen.menus': { free: 2, premium: null, business: null },
} satisfies FireuxAppSubscriptionCapacity
