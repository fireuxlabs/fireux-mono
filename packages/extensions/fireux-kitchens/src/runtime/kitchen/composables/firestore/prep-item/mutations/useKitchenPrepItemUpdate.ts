import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import {
  KitchenPrepItemStorage,
  normalizeKitchenPrepItemInput,
  normalizeKitchenPrepItemTranslatedText,
  normalizeKitchenPrepItemUnit,
  type KitchenPrepItem,
  type KitchenPrepItemUpdateInput,
} from '../../../../models/prep-item.model.ts'
import { useKitchenWorkspaceSelection } from '../../../workspace/core/useKitchenWorkspaceSelection'
import { resolveKitchenScopeCollectionPath } from '../../utils/paths/useKitchenChildCollection'

const trim = (value: unknown) => String(value ?? '').trim()
const quantity = (value: unknown) => {
  const next = Number(value)
  return Number.isFinite(next) && next >= 0 ? next : 0
}

export function useKitchenPrepItemUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenWorkspaceSelection()
  const kitchenCollectionPath = computed(
    () =>
      trim(unref(options.kitchenCollectionPath)) ||
      resolveKitchenScopeCollectionPath(appId)
  )

  const updatePrepItem = async (
    prepItemId: string,
    patch: KitchenPrepItemUpdateInput,
    overrides: { kitchenId?: string } = {}
  ) => {
    requireWritableData()
    const resolvedPrepItemId = trim(prepItemId)
    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!resolvedPrepItemId) throw new Error('Prep Item id is required')
    if (!kitchenId) throw new Error('Kitchen id is required')
    const next: KitchenPrepItemUpdateInput = { ...patch }

    if ('name' in next) next.name = trim(next.name)
    if ('slug' in next) next.slug = trim(next.slug)
    if ('description' in next) next.description = trim(next.description)
    if ('source_language' in next) {
      next.source_language = trim(next.source_language).replace(/_/g, '-')
    }
    if ('names' in next) {
      next.names = normalizeKitchenPrepItemTranslatedText(next.names)
    }
    if ('descriptions' in next) {
      next.descriptions = normalizeKitchenPrepItemTranslatedText(
        next.descriptions
      )
    }
    if ('station' in next) next.station = trim(next.station)
    if ('inputs' in next) {
      next.inputs = (next.inputs ?? []).map(normalizeKitchenPrepItemInput)
    }
    if ('recipe_id' in next) next.recipe_id = trim(next.recipe_id)
    if ('yield' in next) {
      next.yield = {
        quantity: quantity(next.yield?.quantity),
        unit: normalizeKitchenPrepItemUnit(next.yield?.unit),
      }
    }
    if ('method' in next)
      next.method = (next.method ?? []).map(trim).filter(Boolean)

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/${KitchenPrepItemStorage.collection}`
    await updateDocument<KitchenPrepItem>(
      collectionPath,
      resolvedPrepItemId,
      next
    )
  }

  return { updatePrepItem }
}
