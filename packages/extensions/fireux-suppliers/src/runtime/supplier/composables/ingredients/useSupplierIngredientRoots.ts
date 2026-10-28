import { useAsyncData } from 'nuxt/app'

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'

export type SupplierIngredientRoot = {
  id: string
  name: string
  image_url: string
  category: string
}

type IngredientProjectionResponse = {
  items: unknown[]
}

export type SupplierIngredientRootsState = {
  roots: ComputedRef<SupplierIngredientRoot[]>
  rootById: ComputedRef<Map<string, SupplierIngredientRoot>>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const parseRoot = (value: unknown): SupplierIngredientRoot | null => {
  const source = record(value)
  const id = text(source.id)
  const name = text(source.name)
  if (!id || !name) return null
  return {
    id,
    name,
    image_url: text(source.image_url),
    category: text(source.category),
  }
}

export function useSupplierIngredientRoots(
  ids: MaybeRefOrGetter<string[]>,
  options: {
    enabled?: MaybeRefOrGetter<boolean>
  } = {}
): SupplierIngredientRootsState {
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const normalizedIds = computed(() =>
    [...new Set(toValue(ids).map(text).filter(Boolean))].sort()
  )
  const idKey = computed(() => normalizedIds.value.join(','))
  const state = useAsyncData<SupplierIngredientRoot[]>(
    () => `supplier-ingredient-roots-${idKey.value || 'none'}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (!enabled.value || !normalizedIds.value.length) return []

      const pages = await Promise.all(
        Array.from(
          { length: Math.ceil(normalizedIds.value.length / 100) },
          (_, index) => {
            const chunk = normalizedIds.value.slice(
              index * 100,
              (index + 1) * 100
            )
            return fetchRead<IngredientProjectionResponse>(
              `/api/ingredients?ids=${encodeURIComponent(chunk.join(','))}`
            )
          }
        )
      )
      return pages
        .flatMap((page) => (Array.isArray(page.items) ? page.items : []))
        .map(parseRoot)
        .filter((item): item is SupplierIngredientRoot => Boolean(item))
    },
    {
      server: false,
      dedupe: 'defer',
      watch: [enabled, idKey],
    }
  )
  const roots = computed<SupplierIngredientRoot[]>(() => state.data.value ?? [])
  const rootById = computed(
    () =>
      new Map(
        roots.value.map((root: SupplierIngredientRoot) => [root.id, root])
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
    error: computed(() => state.error.value ?? undefined),
    refresh: async () => {
      await state.refresh()
    },
  }
}
