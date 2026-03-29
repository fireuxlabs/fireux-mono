// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/costs/<costId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - Cost snapshots exist only because a kitchen is measuring its own operations.
 * - They should stay scoped to the kitchen even if later reporting rolls them up elsewhere.
 * - If that changes later, update the models README first, then this file.
 */
export type KitchenCostPeriod = 'service' | 'day' | 'week' | 'month'

export const KitchenCostSnapshotModel = {
  id: '' as string,
  kitchen_id: '' as string,

  // Example period_key values:
  // - day:   2026-02-07
  // - week:  2026-W06
  // - month: 2026-02
  period_type: 'day' as KitchenCostPeriod,
  period_key: '' as string,

  currency: 'CHF' as string,
  revenue: 0 as number,
  ingredient_cost: 0 as number,
  labour_cost: 0 as number,
  waste_cost: 0 as number,
  overhead_cost: 0 as number,

  notes: '' as string,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type KitchenCostSnapshot = {
  [K in keyof typeof KitchenCostSnapshotModel]: (typeof KitchenCostSnapshotModel)[K]
}

export type KitchenCostSnapshotCreateInput = Omit<KitchenCostSnapshot, 'created' | 'updated'>
export type KitchenCostSnapshotUpdateInput = Partial<
  Omit<KitchenCostSnapshot, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
