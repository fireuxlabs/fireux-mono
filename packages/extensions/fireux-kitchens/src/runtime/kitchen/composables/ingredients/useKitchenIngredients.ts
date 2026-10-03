import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { resolveKitchenChildCollectionBasePath } from '../../utils/kitchen-collection-path'
import { type IngredientDirectoryPage } from '../../../ingredient/models/ingredient-directory.model.ts'
import type { Ingredient } from '../../../ingredient/utils/ingredient.ts'
import {
  KitchenIngredientStorage,
  type KitchenIngredient,
} from '../../utils/kitchen-ingredient.ts'

const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenIngredientStorage.collection}`

type UseKitchenIngredientsOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
  enabled?: boolean | Ref<boolean | null | undefined>
}

export type KitchenIngredientRecord = Partial<Ingredient> & {
  id: string
  ingredient_id: string
  kitchen_ingredient: KitchenIngredient
  missing_root_ingredient: boolean
}

export function useKitchenIngredients(
  kitchenId: Ref<string> | string,
  options: UseKitchenIngredientsOptions = {}
) {
  const { appId } = useFireUXConfig()
  const isEnabled = computed(() => unref(options.enabled) !== false)

  const resolvedKitchenId = computed(() =>
    String(
      typeof kitchenId === 'string' ? kitchenId : kitchenId.value || ''
    ).trim()
  )

  const kitchenCollectionPath = computed(() =>
    isEnabled.value
      ? resolveKitchenChildCollectionBasePath({
          kitchenCollectionPath: unref(options.kitchenCollectionPath),
          collectionName: KitchenIngredientStorage.collection,
          appId,
        })
      : ''
  )

  const collectionPath = computed(() =>
    isEnabled.value && resolvedKitchenId.value
      ? resolveKitchenCollectionPath(
          kitchenCollectionPath.value,
          resolvedKitchenId.value
        )
      : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const kitchenBinding =
    firestoreFetchCollection<KitchenIngredient>(collectionPath)
  const kitchenItems = kitchenBinding.data

  const linkedIngredientIds = computed(() =>
    [
      ...new Set(
        (kitchenItems.value ?? [])
          .map((entry) => String(entry.ingredient_id || entry.id || '').trim())
          .filter(Boolean)
      ),
    ].sort()
  )
  const linkedIngredientKey = computed(() =>
    linkedIngredientIds.value.join(',')
  )
  const rootState = useLiveAsyncData<IngredientDirectoryPage>(
    () =>
      `kitchen-ingredient-roots-${collectionPath.value || 'empty'}-${linkedIngredientKey.value || 'none'}`,
    async (liveFetch) => {
      const ids = linkedIngredientIds.value
      if (!ids.length) return { items: [] }

      const pages = await Promise.all(
        Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => {
          const chunk = ids.slice(index * 100, (index + 1) * 100)
          return liveFetch<IngredientDirectoryPage>(
            `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
          )
        })
      )
      return { items: pages.flatMap((page) => page.items) }
    },
    {
      server: false,
      dedupe: 'defer',
      watch: [collectionPath, linkedIngredientKey],
    }
  )
  const globalIngredients = computed(() => rootState.data.value?.items)
  const rootIngredientsError = computed(() => rootState.error.value ?? null)
  const error = computed(
    () => kitchenBinding.error.value || rootIngredientsError.value
  )

  const ingredientById = computed(() => {
    const map = new Map<string, Ingredient>()
    for (const ingredient of globalIngredients.value ?? []) {
      const id = String(ingredient.id || '').trim()
      if (!id) continue
      map.set(id, ingredient)
    }
    return map
  })

  const ingredients = computed<KitchenIngredientRecord[]>(() => {
    const kitchenEntries = kitchenItems.value ?? []
    const hydrationUnavailable = Boolean(
      rootIngredientsError.value || rootState.pending.value
    )

    return kitchenEntries.map((entry) => {
      const linkId = String(
        (entry as any).ingredient_id || entry.id || ''
      ).trim()
      const global = ingredientById.value.get(linkId)
      const usage = {
        ...entry,
        id: String(entry.id || linkId).trim() || linkId,
        ingredient_id: linkId,
      } as KitchenIngredient

      if (!global) {
        return {
          id: linkId,
          ingredient_id: linkId,
          name: hydrationUnavailable ? '' : 'Missing ingredient',
          slug: '',
          image_url: '',
          kitchen_ingredient: usage,
          missing_root_ingredient: !hydrationUnavailable,
        }
      }

      // Root ingredient data is canonical; the kitchen record remains relationship metadata.
      return {
        ...global,
        ingredient_id: linkId,
        kitchen_ingredient: usage,
        missing_root_ingredient: false,
      }
    })
  })

  const count = computed(() => ingredients.value.length)
  const pending = computed(() => {
    if (!isEnabled.value || !resolvedKitchenId.value || error.value)
      return false

    return (
      kitchenBinding.pending.value ||
      (linkedIngredientIds.value.length > 0 && rootState.pending.value)
    )
  })
  const { byId: ingredient } = useCollectionById(ingredients)

  return {
    kitchenId: resolvedKitchenId,
    kitchenCollectionPath,
    collectionPath,
    ingredients,
    ingredient,
    count,
    pending,
    error,
  }
}
