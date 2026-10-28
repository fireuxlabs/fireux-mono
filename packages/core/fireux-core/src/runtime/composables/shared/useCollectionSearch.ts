// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: remove obsolete card projection.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable search state declarations.
import { computed, ref, type ComputedRef, type Ref } from 'vue'

export type CollectionVariant = 'pill' | 'cell' | 'summary'

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
  initialVariant?: NoInfer<TVariant>
  variants?: readonly [TVariant, ...TVariant[]]
}

export type UseCollectionSearchReturn<
  TRaw,
  TVariant extends CollectionVariant,
> = {
  query: Ref<string>
  variant: Ref<TVariant>
  toggleVariant: () => void
  normalizedItems: ComputedRef<TRaw[]>
  visibleItems: ComputedRef<TRaw[]>
  visibleCount: ComputedRef<number>
}

const collectSearchParts = (value: unknown): string[] => {
  if (value == null) return []
  if (Array.isArray(value))
    return value.flatMap((entry) => collectSearchParts(entry))
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectSearchParts(entry)
    )
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return [String(value)]
  }
  return []
}

export function useCollectionSearch<
  TRaw,
  TCard,
  TVariant extends CollectionVariant,
>(
  options: UseCollectionSearchOptions<TRaw, TCard, TVariant> & {
    variants: readonly [TVariant, ...TVariant[]]
  }
): UseCollectionSearchReturn<TRaw, TVariant>
export function useCollectionSearch<TRaw, TCard>(
  options: UseCollectionSearchOptions<TRaw, TCard, 'pill' | 'cell'> & {
    variants?: undefined
  }
): UseCollectionSearchReturn<TRaw, 'pill' | 'cell'>
export function useCollectionSearch<TRaw, TCard>(
  options: UseCollectionSearchOptions<TRaw, TCard, CollectionVariant>
): UseCollectionSearchReturn<TRaw, CollectionVariant> {
  const query = ref(options.initialQuery ?? '')
  const variants: CollectionVariant[] = options.variants
    ? [...options.variants]
    : ['pill', 'cell']
  const firstVariant = variants[0]
  if (!firstVariant)
    throw new Error('Collection search requires at least one variant.')
  if (
    variants.some(
      (value) => value !== 'pill' && value !== 'cell' && value !== 'summary'
    )
  ) {
    throw new Error('Collection search received an unsupported variant.')
  }
  const initialVariant =
    options.initialVariant && variants.includes(options.initialVariant)
      ? options.initialVariant
      : firstVariant
  const variant = ref<CollectionVariant>(initialVariant)

  const toggleVariant = () => {
    const currentIndex = variants.indexOf(variant.value)
    variant.value =
      variants[(currentIndex + 1) % variants.length] ?? firstVariant
  }

  const normalizedItems = computed<TRaw[]>(() => options.items.value ?? [])

  const resolveSearchText = (item: TRaw): string => {
    const text = options.searchText
      ? options.searchText(item)
      : collectSearchParts(options.makeCard(item)).join(' ')
    return text.trim().toLowerCase()
  }

  const visibleItems = computed<TRaw[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return normalizedItems.value

    return normalizedItems.value.filter((item) =>
      resolveSearchText(item).includes(q)
    )
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
