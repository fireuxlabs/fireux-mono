// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: remove obsolete card projection.
import { computed, ref, type ComputedRef, type Ref } from 'vue'

export type CollectionVariant = 'pill' | 'cell' | 'preview'

type Searcher<TRaw> = (item: TRaw) => string

type MakeCard<TRaw, TCard> = (item: TRaw) => TCard | null | undefined

type UseCollectionSearchOptions<
  TRaw,
  TCard,
  TVariant extends CollectionVariant,
> = {
  items: Ref<TRaw[] | undefined> | ComputedRef<TRaw[] | undefined>
  searchText?: Searcher<TRaw>
  makeCard: MakeCard<TRaw, TCard>
  initialQuery?: string
  initialVariant?: TVariant
  variants?: readonly TVariant[]
}

const collectSearchParts = (value: unknown): string[] => {
  if (value == null) return []
  if (Array.isArray(value)) return value.flatMap((entry) => collectSearchParts(entry))
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectSearchParts(entry)
    )
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }
  return []
}

export const useCollectionSearch = <
  TRaw,
  TCard,
  TVariant extends CollectionVariant = 'pill' | 'cell',
>(
  options: UseCollectionSearchOptions<TRaw, TCard, TVariant>
) => {
  const query = ref(options.initialQuery ?? '')
  const variants: TVariant[] = options.variants?.length
    ? [...options.variants]
    : ['pill', 'cell'] as TVariant[]
  const initialVariant = options.initialVariant && variants.includes(options.initialVariant)
    ? options.initialVariant
    : variants[0]
  const variant = ref<TVariant>(initialVariant ?? variants[0] ?? 'pill' as TVariant)

  const toggleVariant = () => {
    const currentIndex = variants.indexOf(variant.value)
    variant.value = variants[(currentIndex + 1) % variants.length] ?? variants[0] ?? 'pill'
  }

  const normalizedItems = computed<TRaw[]>(() => options.items.value ?? [])

  const resolveSearchText = (item: TRaw): string => {
    if (options.searchText) return options.searchText(item)

    const card = options.makeCard(item)

    return collectSearchParts(card)
      .join(' ')
      .trim()
      .toLowerCase()
  }

  const visibleItems = computed<TRaw[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return normalizedItems.value

    return normalizedItems.value.filter((item) => resolveSearchText(item).includes(q))
  })

  const visibleCount = computed(() => visibleItems.value.length)

  return {
    query,
    variant,
    toggleVariant,
    normalizedItems,
    visibleItems,
    visibleCount,
  }
}
