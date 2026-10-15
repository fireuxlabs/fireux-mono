import { ref, type Ref } from 'vue'
import { useCollectionSearch } from '../runtime/composables/shared/useCollectionSearch'

type Item = { title: string }
const options = { items: ref<Item[]>([]), makeCard: (item: Item) => item }

export function collectionSearchTypeContract() {
  const defaults = useCollectionSearch(options)
  const defaultVariant: Ref<'pill' | 'cell'> = defaults.variant
  const typedDefaults = useCollectionSearch<Item, Item>({
    ...options,
    initialVariant: 'cell',
  })
  const typedDefaultVariant: Ref<'pill' | 'cell'> = typedDefaults.variant
  const single = useCollectionSearch({ ...options, variants: ['cell'] })
  const singleVariant: Ref<'cell'> = single.variant
  const subset = useCollectionSearch({
    ...options,
    variants: ['summary', 'cell'],
    initialVariant: 'cell',
  })
  const subsetVariant: Ref<'summary' | 'cell'> = subset.variant
  const menu = useCollectionSearch<Item, Item, 'summary' | 'cell' | 'pill'>({
    ...options,
    variants: ['summary', 'cell', 'pill'],
    initialVariant: 'summary',
  })

  // @ts-expect-error A custom generic cannot manufacture an omitted default set.
  useCollectionSearch<Item, Item, 'summary'>(options)
  // @ts-expect-error Custom sets must be nonempty.
  useCollectionSearch({ ...options, variants: [] })
  // @ts-expect-error An initial value cannot expand the declared allowed set.
  useCollectionSearch({
    ...options,
    variants: ['summary'],
    initialVariant: 'pill',
  })
  // @ts-expect-error A single default-named variant still declares a custom set.
  useCollectionSearch({
    ...options,
    variants: ['cell'],
    initialVariant: 'pill',
  })
  // @ts-expect-error A custom subset cannot publish a default pill variant.
  subset.variant.value = 'pill'

  return {
    defaultVariant,
    typedDefaultVariant,
    singleVariant,
    subsetVariant,
    menu,
  }
}
