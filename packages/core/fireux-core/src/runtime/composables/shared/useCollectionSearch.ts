import { computed, ref, type ComputedRef, type Ref } from 'vue'

type Variant = 'pill' | 'cell'

type Searcher<TRaw> = (item: TRaw) => string

type MakeCard<TRaw, TCard> = (item: TRaw) => TCard | null | undefined

type UseCollectionSearchOptions<TRaw, TCard> = {
  items: Ref<TRaw[] | undefined> | ComputedRef<TRaw[] | undefined>
  searchText: Searcher<TRaw>
  makeCard: MakeCard<TRaw, TCard>
  initialQuery?: string
  initialVariant?: Variant
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

  const visibleItems = computed<TRaw[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return normalizedItems.value

    return normalizedItems.value.filter((item) => options.searchText(item).includes(q))
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
