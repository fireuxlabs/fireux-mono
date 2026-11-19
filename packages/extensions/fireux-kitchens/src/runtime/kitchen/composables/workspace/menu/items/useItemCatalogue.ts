import { computed, ref, watch, inject, provide, type InjectionKey } from 'vue'
import { useRoute, useRouter } from '#imports'
import {
  itemCataloguePath,
  readItemCatalogueQuery,
  itemCatalogueQuery,
  type ItemCatalogueState,
} from '../../../../utils/item-catalogue-route'
import {
  createKitchenItemsWorkspace,
  type KitchenItemsContext,
} from './useKitchenItemsContext'

export function useItemCatalogue(items: KitchenItemsContext) {
  const { dishes, outcome, kitchenId, catalogue, storageKitchenId, readOnly } =
    items
  const route = useRoute()
  const router = useRouter()
  const initial = readItemCatalogueQuery(route.query)
  const kindFilters: {
    value: ItemCatalogueState['kind']
    label: string
  }[] = [
    { value: 'all', label: 'All Items' },
    { value: 'food', label: 'Food' },
    { value: 'drink', label: 'Drinks' },
  ]
  const kind = ref<ItemCatalogueState['kind']>(initial.kind)
  const ready = computed(
    () =>
      Boolean(storageKitchenId.value) &&
      ['ready', 'empty'].includes(outcome.value)
  )
  const canCreate = computed(() => ready.value && !readOnly.value)
  const createKind = ref<'food' | 'drink' | null>(null)
  function openCreate(
    itemKind: 'food' | 'drink' = kind.value === 'drink' ? 'drink' : 'food'
  ) {
    if (canCreate.value) createKind.value = itemKind
  }
  function closeCreate() {
    createKind.value = null
  }
  watch([kitchenId, storageKitchenId], closeCreate, { flush: 'sync' })
  watch(
    canCreate,
    (allowed) => {
      if (!allowed) closeCreate()
    },
    { flush: 'sync' }
  )
  const query = ref(initial.search)
  const kindItems = computed(() =>
    dishes.value.filter(
      (dish) => kind.value === 'all' || dish.item_kind === kind.value
    )
  )
  const clearFilters = () => {
    kind.value = 'all'
    query.value = ''
    filter.value = 'all'
  }
  const filter = ref<ItemCatalogueState['filter']>(initial.filter)
  const view = ref<ItemCatalogueState['layout']>(initial.layout)
  const catalogueQuery = computed(() => ({
    ...itemCatalogueQuery({
      kind: kind.value,
      search: query.value,
      filter: filter.value,
      layout: view.value,
      page: page.value,
    }),
  }))
  const itemLink = (
    id: string,
    query: Record<string, string> = {},
    hash = ''
  ) => {
    const search = new URLSearchParams({
      ...catalogueQuery.value,
      ...query,
    }).toString()
    return `${itemCataloguePath}/${encodeURIComponent(id)}${search ? `?${search}` : ''}${hash}`
  }
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
  watch([query, kind, filter], () => {
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
      const nextQuery = { ...route.query }
      for (const key of [
        'kind',
        'search',
        'filter',
        'layout',
        'page',
        'category',
      ])
        delete nextQuery[key]
      Object.assign(nextQuery, next)
      if (
        Object.keys(nextQuery).length === Object.keys(route.query).length &&
        Object.entries(nextQuery).every(
          ([key, value]) => route.query[key] === value
        )
      )
        return
      void router.replace({ path: route.path, query: nextQuery })
    },
    { flush: 'post', immediate: true }
  )
  watch(kitchenId, (_next, previous) => {
    if (!previous) return
    page.value = 1
    kind.value = 'all'
    query.value = ''
    filter.value = 'all'
  })
  return {
    ...items,
    ready,
    canCreate,
    createKind,
    openCreate,
    closeCreate,
    kindFilters,
    kind,
    query,
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

export function useKitchenWorkspaceMenuItems() {
  const catalogue = useItemCatalogue(createKitchenItemsWorkspace('all'))
  provide(catalogueKey, catalogue)
}

export function useItemCatalogueContext() {
  const catalogue = inject(catalogueKey)
  if (!catalogue) throw new Error('Items list requires its catalogue provider.')
  return catalogue
}
