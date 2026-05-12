import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, unref, type Ref } from 'vue'
import {
  normalizeDishMenuPlacements,
  normalizeDishStringArray,
  normalizeDishTranslatedText,
  type Dish,
  type DishUpdateInput,
} from '../../../../../models/dish.model'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/paths'
import { useKitchenSelection } from '../../../app/kitchen-console/useKitchenSelection'

const trim = (value: unknown) => String(value || '').trim()
const optional = (value: unknown) => trim(value) || undefined
const normalizeLanguageCode = (value: unknown) => optional(value)?.replace(/_/g, '-')

export function useDishUpdate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    trim(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  const updateDish = async (
    dishId: string,
    patch: Partial<DishUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => {
    const resolvedDishId = trim(dishId)
    if (!resolvedDishId) throw new Error('Dish id is required')

    const kitchenId = trim(overrides.kitchenId || selectedId.value)
    if (!kitchenId) throw new Error('Kitchen id is required')

    const next: Partial<Dish> & Record<string, unknown> = { ...patch }

    if ('name' in next) next.name = trim(next.name)
    if ('slug' in next) next.slug = optional(next.slug) || ''
    if ('description' in next) next.description = trim(next.description)
    if ('source_language' in next) {
      next.source_language = normalizeLanguageCode(next.source_language) || ''
    }
    if ('names' in next) next.names = normalizeDishTranslatedText(next.names)
    if ('descriptions' in next) {
      next.descriptions = normalizeDishTranslatedText(next.descriptions)
    }
    if ('translated' in next) next.translated = next.translated === true
    if ('menu_placements' in next) {
      next.menu_placements = normalizeDishMenuPlacements(next.menu_placements)
    }
    if ('mise_ids' in next) next.mise_ids = normalizeDishStringArray(next.mise_ids)
    if ('ingredient_ids' in next) {
      next.ingredient_ids = normalizeDishStringArray(next.ingredient_ids)
    }

    const collectionPath = `${kitchenCollectionPath.value}/${kitchenId}/dishes`
    await updateDocument<Dish>(collectionPath, resolvedDishId, next)
  }

  return { updateDish }
}
