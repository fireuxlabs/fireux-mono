// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-mise.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Mise Task (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/mise/{taskId}
 */
export type KitchenMiseStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type KitchenMisePriority = 'low' | 'normal' | 'high' | 'urgent'

export type KitchenMiseChecklistItem = {
  id: string
  label: string
  done: boolean
}

export const KitchenMiseTask = {
  id: '' as string,
  kitchen_id: '' as string,

  title: '' as string,
  description: '' as string,
  station: '' as string,
  service_date: '' as string, // YYYY-MM-DD
  status: 'todo' as KitchenMiseStatus,
  priority: 'normal' as KitchenMisePriority,
  estimated_minutes: 0 as number,

  ingredient_ids: [] as string[],
  mise_ids: [] as string[],
  menu_id: '' as string,
  recipe_id: '' as string,
  assignee_ids: [] as string[],
  checklist: [] as KitchenMiseChecklistItem[],

  // Empty timestamp object means unset.
  due_at: {} as FirebaseTimestamp,
  completed_at: {} as FirebaseTimestamp,
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

export type KitchenMiseTask = {
  [K in keyof typeof KitchenMiseTask]: (typeof KitchenMiseTask)[K]
}

export type KitchenMiseTaskCreateInput = Omit<
  KitchenMiseTask,
  'created' | 'updated'
>
export type KitchenMiseTaskUpdateInput = Partial<
  Omit<KitchenMiseTaskCreateInput, 'id' | 'kitchen_id'>
>
