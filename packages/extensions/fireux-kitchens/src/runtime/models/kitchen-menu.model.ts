// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-menu.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Menu (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/menus/{menuId}
 */
export type KitchenMenuStatus = 'draft' | 'live' | 'paused' | 'archived'
export type KitchenMenuService = 'all_day' | 'breakfast' | 'lunch' | 'dinner' | 'custom'

export const KitchenMenu = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  status: 'draft' as KitchenMenuStatus,
  service: 'all_day' as KitchenMenuService,

  // Ordered dish references for this menu.
  dish_ids: [] as string[],
  stations: [] as string[],
  sort_order: 0 as number,
  active: true as boolean,

  // Empty timestamp object means unset.
  starts_at: {} as FirebaseTimestamp,
  ends_at: {} as FirebaseTimestamp,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenMenu = {
  [K in keyof typeof KitchenMenu]: (typeof KitchenMenu)[K]
}

export type KitchenMenuCreateInput = Omit<
  KitchenMenu,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenMenuUpdateInput = Partial<Omit<KitchenMenuCreateInput, 'id' | 'kitchen_id'>>

