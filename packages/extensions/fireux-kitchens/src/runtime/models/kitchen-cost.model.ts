// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Cost Snapshot (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/costs/{costId}
 */
export type KitchenCostPeriod = 'service' | 'day' | 'week' | 'month'

export const KitchenCostSnapshot = {
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

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenCostSnapshot = {
  [K in keyof typeof KitchenCostSnapshot]: (typeof KitchenCostSnapshot)[K]
}

export type KitchenCostSnapshotCreateInput = Omit<
  KitchenCostSnapshot,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenCostSnapshotUpdateInput = Partial<
  Omit<KitchenCostSnapshotCreateInput, 'id' | 'kitchen_id'>
>

