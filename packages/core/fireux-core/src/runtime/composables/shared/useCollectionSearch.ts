import { computed, ref, type ComputedRef, type Ref } from 'vue'

type Variant = 'pill' | 'cell'

type Searcher<TRaw> = (item: TRaw) => string

type MakeCard<TRaw, TCard> = (item: TRaw) => TCard | null | undefined

type UseCollectionSearchOptions<TRaw, TCard> = {
  items: Ref<TRaw[] | undefined> | ComputedRef<TRaw[] | undefined>
  searchText?: Searcher<TRaw>
  makeCard: MakeCard<TRaw, TCard>
  initialQuery?: string
  initialVariant?: Variant
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

export const useCollectionSearch = <TRaw, TCard>(
  options: UseCollectionSearchOptions<TRaw, TCard>
) => {
  const query = ref(options.initialQuery ?? '')
  const variant = ref<Variant>(options.initialVariant ?? 'pill')

  const toggleVariant = () => {
    variant.value = variant.value === 'pill' ? 'cell' : 'pill'
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

  const cards = computed<TCard[]>(() =>
    visibleItems.value
      .map((item) => options.makeCard(item))
      .filter((card): card is TCard => Boolean(card))
  )

  return {
    query,
    variant,
    toggleVariant,
    normalizedItems,
    visibleItems,
    visibleCount,
    cards,
  }
}
