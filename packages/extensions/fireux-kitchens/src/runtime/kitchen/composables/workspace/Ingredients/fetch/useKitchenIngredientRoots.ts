import { useAsyncData } from '#imports'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { IngredientDirectoryPage } from '../../../../../ingredient/models/ingredient-directory.model.ts'
import type { Ingredient } from '../../../../../ingredient/utils/ingredient.ts'

type KitchenIngredientRootsState = {
  roots: ComputedRef<Ingredient[]>
  rootById: ComputedRef<Map<string, Ingredient>>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | null>
  refresh: () => Promise<void>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenIngredientRoots(
  ids: MaybeRefOrGetter<string[]>,
  options: {
    enabled?: MaybeRefOrGetter<boolean>
  } = {}
): KitchenIngredientRootsState {
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const normalizedIds = computed(() =>
    [...new Set(toValue(ids).map(text).filter(Boolean))].sort()
  )
  const idKey = computed(() => normalizedIds.value.join(','))
  const state = useAsyncData<IngredientDirectoryPage>(
    () => `kitchen-ingredient-roots-${idKey.value || 'none'}`,
    async () => {
      if (!enabled.value || !normalizedIds.value.length) return { items: [] }

      const pages = await Promise.all(
        Array.from(
          { length: Math.ceil(normalizedIds.value.length / 100) },
          (_, index) => {
            const chunk = normalizedIds.value.slice(
              index * 100,
              (index + 1) * 100
            )
            return $fetch<IngredientDirectoryPage>(
              `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
            )
          }
        )
      )
      return { items: pages.flatMap((page) => page.items) }
    },
    {
      server: false,
      dedupe: 'defer',
      watch: [enabled, idKey],
    }
  )
  const roots = computed<Ingredient[]>(() => state.data.value?.items ?? [])
  const rootById = computed<Map<string, Ingredient>>(
    () =>
      new Map<string, Ingredient>(
        roots.value.map((root: Ingredient) => [root.id, root])
      )
  )

  return {
    roots,
    rootById,
    pending: computed(
      () =>
        enabled.value &&
        Boolean(normalizedIds.value.length) &&
        state.pending.value
    ),
    error: computed(() => state.error.value ?? null),
    refresh: async () => {
      await state.refresh()
    },
  }
}
