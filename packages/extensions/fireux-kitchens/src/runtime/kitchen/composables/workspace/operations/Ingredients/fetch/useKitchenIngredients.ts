import { useAsyncData } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import {
  useCollection,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  collection,
  query as fsq,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Ref } from 'vue'
import { computed, ref, unref } from 'vue'
import { resolveKitchenChildCollectionBasePath } from '../../../../firestore/utils/paths/useKitchenChildCollection'
import { type IngredientDirectoryPage } from '../../../../../../ingredient/models/ingredient-directory.model.ts'
import type { Ingredient } from '../../../../../../ingredient/models/ingredient.model.ts'
import {
  KitchenIngredientStorage,
  type KitchenIngredient,
} from '../../../../../models/ingredient.model.ts'

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
  const resolveDb = useFirestoreResolver(options.databaseId)

  const kitchenQuery = computed<Query<KitchenIngredient> | null>(() => {
    const path = collectionPath.value
    if (!path) return null
    return fsq(collection(resolveDb(), path)) as Query<KitchenIngredient>
  })
  const kitchenBinding = import.meta.server
    ? null
    : useCollection<KitchenIngredient>(kitchenQuery, {
        ssrKey: computed(
          () => collectionPath.value || 'kitchen-ingredients-empty'
        ),
        transform: (docSnap: QueryDocumentSnapshot<KitchenIngredient>) => {
          const value = {
            ...(docSnap.data() as KitchenIngredient),
            id: docSnap.id,
          } as KitchenIngredient & Record<string, unknown>
          return collectionPath.value
            ? (attachDevCollectionMeta(
                value,
                collectionPath.value,
                docSnap.id
              ) as KitchenIngredient)
            : (value as KitchenIngredient)
        },
      } as any)
  const kitchenItems = import.meta.server
    ? (ref(undefined) as Ref<KitchenIngredient[] | undefined>)
    : ((kitchenBinding as any).data as Ref<KitchenIngredient[] | undefined>)

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
  const rootState = useAsyncData<IngredientDirectoryPage>(
    () =>
      `kitchen-ingredient-roots-${collectionPath.value || 'empty'}-${linkedIngredientKey.value || 'none'}`,
    async () => {
      const ids = linkedIngredientIds.value
      if (!ids.length) return { items: [] }

      const pages = await Promise.all(
        Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => {
          const chunk = ids.slice(index * 100, (index + 1) * 100)
          return $fetch<IngredientDirectoryPage>(
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
    if (!isEnabled.value || !resolvedKitchenId.value) return false

    return (
      kitchenItems.value === undefined ||
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
    error: rootIngredientsError,
  }
}
