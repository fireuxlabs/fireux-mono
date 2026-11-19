import { computed, ref, watch, inject, provide, type InjectionKey } from 'vue'
import { useRoute, useRouter } from '#imports'
import {
  itemCataloguePath,
  readItemCatalogueQuery,
  type ItemCatalogueState,
} from '../../../../utils/item-catalogue-route'
import {
  createKitchenItemsWorkspace,
  type KitchenItemsContext,
} from './useKitchenItemsContext'

export function useItemCatalogue(items: KitchenItemsContext) {
  const {
    dishes,
    outcome,
    kitchenId,
    catalogue,
    storageKitchenId,
    readOnly,
    error,
    selectedKitchen,
  } = items
  const route = useRoute()
  const router = useRouter()
  const initial = readItemCatalogueQuery(route.query)
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
  const itemLink = (
    id: string,
    query: Record<string, string> = {},
    hash = ''
  ) => {
    const search = new URLSearchParams(query).toString()
    return `${itemCataloguePath}/${encodeURIComponent(id)}${search ? `?${search}` : ''}${hash}`
  }
  const normalize = (value: unknown) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
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
      .sort((a, b) => a.name.localeCompare(b.name))
  )
  const visibleCount = computed(() => visibleItems.value.length)
  const page = ref(initial.page)
  const pageSize = 40
  const pageItems = computed(() =>
    visibleItems.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  watch([query, kind, filter], () => {
    page.value = 1
  })
  watch(
    [visibleCount, outcome],
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
    () => route.query,
    () => {
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
      if (Object.keys(nextQuery).length === Object.keys(route.query).length)
        return
      void router.replace({
        path: route.path,
        query: nextQuery,
        hash: route.hash,
      })
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
    catalogue,
    kitchenId,
    storageKitchenId,
    outcome,
    error,
    readOnly,
    currency: computed(() => selectedKitchen.value?.currency_code || ''),
    ready,
    canCreate,
    createKind,
    openCreate,
    closeCreate,
    kind,
    query,
    view,
    visibleCount,
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
