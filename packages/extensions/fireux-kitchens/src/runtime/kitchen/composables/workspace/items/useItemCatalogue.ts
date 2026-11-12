import { computed, ref, watch, inject, provide, type InjectionKey } from 'vue'
import { useRoute, useRouter } from '#imports'
import {
  itemCataloguePath,
  readItemCatalogueQuery,
  itemCatalogueQuery,
  type ItemCatalogueState,
} from '../../../utils/item-catalogue-route'
import { useKitchenItemsContext } from './useKitchenItemsContext'

export function useItemCatalogue() {
  const { dishes, outcome, kitchenId, catalogue } = useKitchenItemsContext()
  const route = useRoute()
  const router = useRouter()
  const initial = readItemCatalogueQuery(route.query)
  const kindFilters = [
    { value: 'all', label: 'All Items' },
    { value: 'food', label: 'Food' },
    { value: 'drink', label: 'Drinks' },
  ] as const
  const kind = ref<ItemCatalogueState['kind']>(initial.kind)
  watch(kind, () => {
    category.value = 'all'
  })
  const query = ref(initial.search)
  const category = ref(initial.category)
  const kindItems = computed(() =>
    dishes.value.filter(
      (dish) => kind.value === 'all' || dish.item_kind === kind.value
    )
  )
  const categoryFilters = computed(() => {
    const counts = new Map<string, number>()
    for (const item of kindItems.value) {
      if (item.category)
        counts.set(item.category, (counts.get(item.category) || 0) + 1)
    }
    return [
      { value: 'all', label: 'All Items', count: kindItems.value.length },
      ...[...counts]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, count]) => ({
          value: `category:${label}`,
          label,
          count,
        })),
      {
        value: 'uncategorised',
        label: 'Uncategorised',
        count: kindItems.value.filter((item) => !item.category).length,
      },
    ].filter((item) => item.value === 'all' || item.count > 0)
  })
  const clearFilters = () => {
    kind.value = 'all'
    query.value = ''
    filter.value = 'all'
    category.value = 'all'
  }
  const filter = ref<ItemCatalogueState['filter']>(initial.filter)
  const view = ref<ItemCatalogueState['layout']>(initial.layout)
  const catalogueQuery = computed(() => ({
    ...itemCatalogueQuery({
      kind: kind.value,
      search: query.value,
      category: category.value,
      filter: filter.value,
      layout: view.value,
      page: page.value,
    }),
  }))
  const itemLink = (id: string) =>
    `${itemCataloguePath}/${encodeURIComponent(id)}?${new URLSearchParams(catalogueQuery.value)}`
  const normalize = (value: unknown) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  const filters = computed(
    () =>
      [
        { value: 'all', label: 'All', count: kindItems.value.length },
        {
          value: 'image',
          label: 'Missing image',
          count: kindItems.value.filter((d) => !d.image?.trim()).length,
        },
        {
          value: 'description',
          label: 'Missing description',
          count: kindItems.value.filter((d) => !d.description?.trim()).length,
        },
      ] as const
  )
  const visibleItems = computed(() =>
    kindItems.value
      .filter(
        (dish) =>
          (category.value === 'all' ||
            (category.value === 'uncategorised'
              ? !dish.category
              : dish.category ===
                (category.value.startsWith('category:')
                  ? category.value.slice(9)
                  : category.value))) &&
          (!normalize(query.value) ||
            normalize(`${dish.name} ${dish.description || ''}`).includes(
              normalize(query.value)
            )) &&
          (filter.value !== 'image' || !dish.image?.trim()) &&
          (filter.value !== 'description' || !dish.description?.trim())
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  )
  const page = ref(initial.page)
  const pageSize = 40
  const pageItems = computed(() =>
    visibleItems.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  watch([query, kind, category, filter], () => {
    page.value = 1
  })
  watch(
    [() => visibleItems.value.length, outcome],
    ([count]) => {
      if (!['ready', 'empty'].includes(outcome.value)) return
      page.value = Math.min(
        page.value,
        Math.max(1, Math.ceil(count / pageSize))
      )
    },
    { immediate: true }
  )
  watch(
    catalogueQuery,
    (next) => {
      if (route.path !== catalogue.path) return
      if (
        Object.entries(next).every(([key, value]) => route.query[key] === value)
      )
        return
      void router.replace({
        path: route.path,
        query: { ...route.query, ...next },
      })
    },
    { flush: 'post' }
  )
  watch(kitchenId, (_next, previous) => {
    if (!previous) return
    page.value = 1
    kind.value = 'all'
    query.value = ''
    filter.value = 'all'
    category.value = 'all'
  })
  return {
    kindFilters,
    kind,
    query,
    category,
    categoryFilters,
    filter,
    filters,
    view,
    visibleItems,
    page,
    pageSize,
    pageItems,
    itemLink,
    clearFilters,
  }
}

const catalogueKey: InjectionKey<ReturnType<typeof useItemCatalogue>> =
  Symbol('ItemCatalogue')

export function provideItemCatalogue() {
  provide(catalogueKey, useItemCatalogue())
}

export function useItemCatalogueContext() {
  const catalogue = inject(catalogueKey)
  if (!catalogue) throw new Error('Items list requires its catalogue provider.')
  return catalogue
}
