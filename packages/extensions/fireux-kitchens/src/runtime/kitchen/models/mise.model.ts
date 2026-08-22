import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type KitchenMiseStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type KitchenMisePriority = 'low' | 'normal' | 'high' | 'urgent'
export type KitchenMiseWorkflowStage = 'wash' | 'cut_portion' | 'make' | 'cook_chill' | 'set_stations' | 'final_checks'

export type KitchenMiseChecklistItem = {
  id: string
  label: string
  done: boolean
}

export type KitchenMiseTask = FireuxStamped & {
  id: string
  kitchen_id: string
  title: string
  description: string
  station: string
  workflow_stage?: KitchenMiseWorkflowStage | ''
  service_date: string
  status: KitchenMiseStatus
  priority: KitchenMisePriority
  estimated_minutes: number
  ingredient_ids: string[]
  prep_item_ids: string[]
  menu_id: string
  recipe_id: string
  assignee_ids: string[]
  checklist: KitchenMiseChecklistItem[]
  due_at: FirebaseTimestamp
  completed_at: FirebaseTimestamp
  notes: string
}
