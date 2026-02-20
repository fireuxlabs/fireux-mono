import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  KitchenMiseTask,
  type KitchenMiseChecklistItem,
  type KitchenMisePriority,
  type KitchenMiseStatus,
  type KitchenMiseTask as KitchenMiseTaskDoc,
} from '../../../../../../models/kitchen-mise.model'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/mise`

type KitchenMiseCreateDraft = {
  title: string
  description?: string
  station?: string
  service_date?: string
  status?: KitchenMiseStatus
  priority?: KitchenMisePriority
  estimated_minutes?: number
  ingredient_ids?: string[]
  mise_ids?: string[]
  menu_id?: string
  assignee_ids?: string[]
  checklist?: KitchenMiseChecklistItem[]
  recipe_id?: string
  notes?: string
}

const resolveStatus = (value: unknown): KitchenMiseStatus => {
  const allowed = new Set<KitchenMiseStatus>(['todo', 'in_progress', 'done', 'blocked'])
  const normalized = String(value || '').trim() as KitchenMiseStatus
  return allowed.has(normalized) ? normalized : 'todo'
}

const resolvePriority = (value: unknown): KitchenMisePriority => {
  const allowed = new Set<KitchenMisePriority>(['low', 'normal', 'high', 'urgent'])
  const normalized = String(value || '').trim() as KitchenMisePriority
  return allowed.has(normalized) ? normalized : 'normal'
}

const toSafeNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toStringArray = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  )

const buildMisePayload = (kitchenId: string, draft: KitchenMiseCreateDraft): KitchenMiseTaskDoc => ({
  ...KitchenMiseTask,
  kitchen_id: kitchenId,
  title: String(draft.title || '').trim(),
  description: String(draft.description || '').trim(),
  station: String(draft.station || '').trim(),
  service_date: String(draft.service_date || '').trim(),
  status: resolveStatus(draft.status),
  priority: resolvePriority(draft.priority),
  estimated_minutes: toSafeNumber(draft.estimated_minutes),
  ingredient_ids: toStringArray(draft.ingredient_ids),
  mise_ids: toStringArray(draft.mise_ids),
  menu_id: String(draft.menu_id || '').trim(),
  assignee_ids: toStringArray(draft.assignee_ids),
  checklist: Array.isArray(draft.checklist) ? draft.checklist : [],
  recipe_id: String(draft.recipe_id || '').trim(),
  notes: String(draft.notes || '').trim(),
})

export function useKitchenMiseCreate() {
  const { createDocument } = useFirestoreCreate()

  const createKitchenMiseTask = async (
    kitchenId: string,
    draft: KitchenMiseCreateDraft,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const title = String(draft.title || '').trim()
    if (!title) throw new Error('Task title is required')

    const payload = buildMisePayload(resolvedKitchenId, draft)
    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || DEFAULT_KITCHEN_COLLECTION_PATH
    ).trim()
    const collectionPath = resolveKitchenCollectionPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    return createDocument<KitchenMiseTaskDoc>(
      collectionPath,
      payload,
      { app: true, creator: true }
    )
  }

  return { createKitchenMiseTask }
}
