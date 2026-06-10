import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { resolveKitchenScopeCollectionPath } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenMiseTaskStorage,
  KitchenMiseTaskModel,
  type KitchenMiseChecklistItem,
  type KitchenMisePriority,
  type KitchenMiseStatus,
  type KitchenMiseTask as KitchenMiseTaskDoc,
} from '../../../../../../../models/kitchen-mise.model'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenMiseTaskStorage.collection}`

const normalizeString = (value: unknown) => String(value ?? '').trim()

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
  const normalized = normalizeString(value) as KitchenMiseStatus
  return allowed.has(normalized) ? normalized : 'todo'
}

const resolvePriority = (value: unknown): KitchenMisePriority => {
  const allowed = new Set<KitchenMisePriority>(['low', 'normal', 'high', 'urgent'])
  const normalized = normalizeString(value) as KitchenMisePriority
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
        .map((item) => normalizeString(item))
        .filter(Boolean)
    )
  )

const buildMisePayload = (kitchenId: string, draft: KitchenMiseCreateDraft): KitchenMiseTaskDoc => ({
  ...KitchenMiseTaskModel,
  kitchen_id: kitchenId,
  title: normalizeString(draft.title),
  description: normalizeString(draft.description),
  station: normalizeString(draft.station),
  service_date: normalizeString(draft.service_date),
  status: resolveStatus(draft.status),
  priority: resolvePriority(draft.priority),
  estimated_minutes: toSafeNumber(draft.estimated_minutes),
  ingredient_ids: toStringArray(draft.ingredient_ids),
  mise_ids: toStringArray(draft.mise_ids),
  menu_id: normalizeString(draft.menu_id),
  assignee_ids: toStringArray(draft.assignee_ids),
  checklist: Array.isArray(draft.checklist) ? draft.checklist : [],
  recipe_id: normalizeString(draft.recipe_id),
  notes: normalizeString(draft.notes),
})

export function useKitchenMiseCreate() {
  const { createDocument } = useFirestoreCreate()
  const { appId } = useFireUXConfig()

  const createKitchenMiseTask = async (
    kitchenId: string,
    draft: KitchenMiseCreateDraft,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = normalizeString(kitchenId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const title = normalizeString(draft.title)
    if (!title) throw new Error('Task title is required')

    const payload = buildMisePayload(resolvedKitchenId, draft)
    const kitchenCollectionPath =
      normalizeString(options.kitchenCollectionPath) || resolveKitchenScopeCollectionPath(appId)
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
