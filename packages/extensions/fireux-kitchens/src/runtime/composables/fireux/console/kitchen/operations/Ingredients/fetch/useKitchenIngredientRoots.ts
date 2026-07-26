import { useAsyncData } from '#imports'
import {
  computed,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  PublicIngredient,
  PublicIngredientCollectionResponse,
} from '../../../../../../../models/ingredient-public.model'

type KitchenIngredientRootsState = {
  roots: ComputedRef<PublicIngredient[]>
  rootById: ComputedRef<Map<string, PublicIngredient>>
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
  const enabled = computed(() =>
    options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const normalizedIds = computed(() => [
    ...new Set(toValue(ids).map(text).filter(Boolean)),
  ].sort())
  const idKey = computed(() => normalizedIds.value.join(','))
  const state = useAsyncData<PublicIngredientCollectionResponse>(
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
            return $fetch<PublicIngredientCollectionResponse>(
              `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
            )
          }
        )
      )
      return { items: pages.flatMap(page => page.items) }
    },
    {
      server: false,
      dedupe: 'defer',
      watch: [enabled, idKey],
    }
  )
  const roots = computed<PublicIngredient[]>(
    () => state.data.value?.items ?? []
  )
  const rootById = computed<Map<string, PublicIngredient>>(
    () =>
      new Map<string, PublicIngredient>(
        roots.value.map((root: PublicIngredient) => [root.id, root])
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
