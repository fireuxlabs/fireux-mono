// FILE: packages/extensions/fireux-kitchens/src/runtime/kitchen/models/mise.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: apps/{appId}/kitchens/{kitchenId}/mise-tasks/{taskId}
 * Owner app scope: Kitchen
 *
 * Decision note:
 * - Mise tasks exist because a kitchen is organizing service work.
 * - They are operational records, not reusable global entities.
 * - If that changes later, update the models README first, then this file.
 */
export const KitchenMiseTaskStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/mise-tasks/{taskId}',
  collection: 'mise-tasks',
  parent: 'kitchen',
  idParam: 'taskId',
} as const

export const KitchenMiseTaskRecord = defineFireuxEntity({
  kind: 'record',
  name: 'KitchenMiseTask',
  family: ['kitchen', 'support'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'Kitchen',
  scoped: KitchenMiseTaskStorage.path,
  notes: [
    'Kitchen owns Mise workflow, scheduling and assignment state.',
    'Mise tasks may reference Kitchen-owned Stations, Team, Menus and Recipes.',
  ],
})

export const KITCHEN_MISE_STATUSES = [
  'todo',
  'in_progress',
  'done',
  'blocked',
] as const
export type KitchenMiseStatus = (typeof KITCHEN_MISE_STATUSES)[number]

export const KITCHEN_MISE_STATUS_OPTIONS = [
  {
    value: 'todo',
    label: 'To do',
    icon: 'i-lucide-circle',
    color: 'neutral',
  },
  {
    value: 'in_progress',
    label: 'In progress',
    icon: 'i-lucide-loader-circle',
    color: 'primary',
  },
  {
    value: 'done',
    label: 'Done',
    icon: 'i-lucide-circle-check',
    color: 'success',
  },
  {
    value: 'blocked',
    label: 'Blocked',
    icon: 'i-lucide-circle-alert',
    color: 'error',
  },
] as const

export const KITCHEN_MISE_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const
export type KitchenMisePriority = (typeof KITCHEN_MISE_PRIORITIES)[number]

export const KITCHEN_MISE_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

export const KITCHEN_MISE_WORKFLOW_STAGES = [
  'wash',
  'cut_portion',
  'make',
  'cook_chill',
  'set_stations',
  'final_checks',
] as const
export type KitchenMiseWorkflowStage =
  (typeof KITCHEN_MISE_WORKFLOW_STAGES)[number]

export const KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS = [
  {
    value: 'wash',
    label: 'Wash & clean',
    icon: 'i-lucide-droplets',
  },
  {
    value: 'cut_portion',
    label: 'Cut & portion',
    icon: 'i-lucide-scaling',
  },
  {
    value: 'make',
    label: 'Make',
    icon: 'i-lucide-cooking-pot',
  },
  {
    value: 'cook_chill',
    label: 'Cook & chill',
    icon: 'i-lucide-thermometer-snowflake',
  },
  {
    value: 'set_stations',
    label: 'Set stations',
    icon: 'i-lucide-panels-top-left',
  },
  {
    value: 'final_checks',
    label: 'Final checks',
    icon: 'i-lucide-clipboard-check',
  },
] as const

const kitchenMiseStatuses = new Set<string>(KITCHEN_MISE_STATUSES)
const kitchenMisePriorities = new Set<string>(KITCHEN_MISE_PRIORITIES)
const kitchenMiseWorkflowStages = new Set<string>(
  KITCHEN_MISE_WORKFLOW_STAGES
)

export const normalizeKitchenMiseStatus = (
  value: unknown
): KitchenMiseStatus => {
  const status = String(value ?? '').trim()
  return kitchenMiseStatuses.has(status)
    ? status as KitchenMiseStatus
    : 'todo'
}

export const normalizeKitchenMisePriority = (
  value: unknown
): KitchenMisePriority => {
  const priority = String(value ?? '').trim()
  return kitchenMisePriorities.has(priority)
    ? priority as KitchenMisePriority
    : 'normal'
}

export const normalizeKitchenMiseWorkflowStage = (
  value: unknown
): KitchenMiseWorkflowStage | '' => {
  const stage = String(value ?? '').trim()
  return kitchenMiseWorkflowStages.has(stage)
    ? stage as KitchenMiseWorkflowStage
    : ''
}

export const kitchenMisePriorityLabel = (value: unknown) => {
  const priority = normalizeKitchenMisePriority(value)
  return KITCHEN_MISE_PRIORITY_OPTIONS.find(
    option => option.value === priority
  )?.label || 'Normal'
}

export type KitchenMiseChecklistItem = {
  id: string
  label: string
  done: boolean
}

export interface KitchenMiseTask extends FireuxStamped {
  id: string
  kitchen_id: string
  title: string
  description: string
  station: string
  /** Missing legacy values remain visible in the Unsorted workflow group. */
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

export const KitchenMiseTaskDefaults = {
  id: '' as string,
  kitchen_id: '' as string,

  title: '' as string,
  description: '' as string,
  station: '' as string,
  workflow_stage: '' as KitchenMiseWorkflowStage | '',
  service_date: '' as string, // YYYY-MM-DD
  status: 'todo' as KitchenMiseStatus,
  priority: 'normal' as KitchenMisePriority,
  estimated_minutes: 0 as number,

  ingredient_ids: [] as string[],
  prep_item_ids: [] as string[],
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
} as const satisfies KitchenMiseTask

export type KitchenMiseTaskCreateInput = Omit<KitchenMiseTask, 'created' | 'updated'>
export type KitchenMiseTaskUpdateInput = Partial<
  Omit<KitchenMiseTask, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const kitchenMiseRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const kitchenMiseString = (value: unknown) => String(value ?? '').trim()

const kitchenMiseStringArray = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map(item => kitchenMiseString(item))
        .filter(Boolean)
    )
  )

const normalizeKitchenMiseChecklist = (
  value: unknown
): KitchenMiseChecklistItem[] =>
  (Array.isArray(value) ? value : [])
    .map((item) => {
      const source = kitchenMiseRecord(item)
      return {
        id: kitchenMiseString(source.id),
        label: kitchenMiseString(source.label),
        done: source.done === true,
      }
    })
    .filter(item => item.id && item.label)

const kitchenMiseTimestamp = (
  value: unknown,
  fallback: FirebaseTimestamp
): FirebaseTimestamp =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as FirebaseTimestamp
    : fallback

const kitchenMiseEstimatedMinutes = (value: unknown) => {
  const minutes = Number(value)
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : 0
}

export function normalizeKitchenMiseTask(value: unknown): KitchenMiseTask {
  const source = kitchenMiseRecord(value)
  const created = source.created && typeof source.created === 'object'
    ? source.created as KitchenMiseTask['created']
    : KitchenMiseTaskDefaults.created
  const updated = source.updated && typeof source.updated === 'object'
    ? source.updated as KitchenMiseTask['updated']
    : KitchenMiseTaskDefaults.updated

  return {
    ...KitchenMiseTaskDefaults,
    id: kitchenMiseString(source.id),
    kitchen_id: kitchenMiseString(source.kitchen_id),
    title: kitchenMiseString(source.title),
    description: kitchenMiseString(source.description),
    station: kitchenMiseString(source.station),
    workflow_stage: normalizeKitchenMiseWorkflowStage(source.workflow_stage),
    service_date: kitchenMiseString(source.service_date),
    status: normalizeKitchenMiseStatus(source.status),
    priority: normalizeKitchenMisePriority(source.priority),
    estimated_minutes: kitchenMiseEstimatedMinutes(source.estimated_minutes),
    ingredient_ids: kitchenMiseStringArray(source.ingredient_ids),
    prep_item_ids: kitchenMiseStringArray(source.prep_item_ids),
    menu_id: kitchenMiseString(source.menu_id),
    recipe_id: kitchenMiseString(source.recipe_id),
    assignee_ids: kitchenMiseStringArray(source.assignee_ids),
    checklist: normalizeKitchenMiseChecklist(source.checklist),
    due_at: kitchenMiseTimestamp(
      source.due_at,
      KitchenMiseTaskDefaults.due_at
    ),
    completed_at: kitchenMiseTimestamp(
      source.completed_at,
      KitchenMiseTaskDefaults.completed_at
    ),
    notes: kitchenMiseString(source.notes),
    created,
    updated,
  }
}
