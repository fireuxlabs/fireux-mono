import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { resolveKitchenScopeCollectionPath } from '../../../../firestore/utils/paths/useKitchenChildCollection'
import {
  KitchenMiseTaskStorage,
  KitchenMiseTaskDefaults,
  normalizeKitchenMisePriority,
  normalizeKitchenMiseStatus,
  normalizeKitchenMiseWorkflowStage,
  type KitchenMiseChecklistItem,
  type KitchenMisePriority,
  type KitchenMiseStatus,
  type KitchenMiseWorkflowStage,
  type KitchenMiseTask as KitchenMiseTaskDoc,
} from '../../../../../utils/mise.ts'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenMiseTaskStorage.collection}`

const normalizeString = (value: unknown) => String(value ?? '').trim()

type KitchenMiseCreateDraft = {
  title: string
  description?: string
  station?: string
  workflow_stage?: KitchenMiseWorkflowStage | ''
  service_date?: string
  status?: KitchenMiseStatus
  priority?: KitchenMisePriority
  estimated_minutes?: number
  ingredient_ids?: string[]
  prep_item_ids?: string[]
  menu_id?: string
  assignee_ids?: string[]
  checklist?: KitchenMiseChecklistItem[]
  recipe_id?: string
  notes?: string
}

const toSafeNumber = (value: unknown, defaultValue = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : defaultValue
}

const toStringArray = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => normalizeString(item))
        .filter(Boolean)
    )
  )

const buildMisePayload = (
  kitchenId: string,
  draft: KitchenMiseCreateDraft
): KitchenMiseTaskDoc => ({
  ...KitchenMiseTaskDefaults,
  kitchen_id: kitchenId,
  title: normalizeString(draft.title),
  description: normalizeString(draft.description),
  station: normalizeString(draft.station),
  workflow_stage: normalizeKitchenMiseWorkflowStage(draft.workflow_stage),
  service_date: normalizeString(draft.service_date),
  status: normalizeKitchenMiseStatus(draft.status),
  priority: normalizeKitchenMisePriority(draft.priority),
  estimated_minutes: toSafeNumber(draft.estimated_minutes),
  ingredient_ids: toStringArray(draft.ingredient_ids),
  prep_item_ids: toStringArray(draft.prep_item_ids),
  menu_id: normalizeString(draft.menu_id),
  assignee_ids: toStringArray(draft.assignee_ids),
  checklist: Array.isArray(draft.checklist) ? draft.checklist : [],
  recipe_id: normalizeString(draft.recipe_id),
  notes: normalizeString(draft.notes),
})

export function useKitchenMiseCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const { appId } = useFireUXConfig()

  const createKitchenMiseTask = async (
    kitchenId: string,
    draft: KitchenMiseCreateDraft,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    requireWritableData()
    const resolvedKitchenId = normalizeString(kitchenId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const title = normalizeString(draft.title)
    if (!title) throw new Error('Task title is required')

    const payload = buildMisePayload(resolvedKitchenId, draft)
    const kitchenCollectionPath =
      normalizeString(options.kitchenCollectionPath) ||
      resolveKitchenScopeCollectionPath(appId)
    const collectionPath = resolveKitchenCollectionPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    return create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-mise-tasks',
        collectionPath
      ),
      payload,
      { app: true, creator: true }
    )
  }

  return { createKitchenMiseTask }
}
