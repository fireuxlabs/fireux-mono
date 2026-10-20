import { computed, ref, watch, inject, provide, type InjectionKey } from 'vue'
import { useRoute, useRouter } from '#imports'
import { dishCategories } from '../../../models/dish.model'
import {
  dishCataloguePath,
  readDishCatalogueQuery,
  dishCatalogueQuery,
  type DishCatalogueState,
} from '../../../utils/dish-catalogue-route'
import { useKitchenDishesContext } from './useKitchenDishesContext'

export function useDishCatalogue() {
  const { dishes, outcome, kitchenId, catalogue } = useKitchenDishesContext()
  const route = useRoute()
  const router = useRouter()
  const initial = readDishCatalogueQuery(route.query)
  const kindFilters = [
    { value: 'all', label: 'All' },
    { value: 'food', label: 'Food' },
    { value: 'drink', label: 'Drinks' },
  ] as const
  const kind = ref<DishCatalogueState['kind']>(initial.kind)
  watch(kind, () => {
    category.value = 'all'
  })
  const query = ref(initial.search)
  const category = ref(initial.category)
  const kindDishes = computed(() =>
    dishes.value.filter(
      (dish) => kind.value === 'all' || dish.item_kind === kind.value
    )
  )
  const foodDishes = computed(() =>
    dishes.value.filter((dish) => dish.item_kind === 'food')
  )
  const categoryFilters = computed(() =>
    [
      { value: 'all', label: 'All dishes', count: foodDishes.value.length },
      ...dishCategories.map((item) => ({
        ...item,
        count: foodDishes.value.filter((dish) => dish.category === item.value)
          .length,
      })),
      {
        value: 'uncategorised',
        label: 'Uncategorised',
        count: foodDishes.value.filter((dish) => !dish.category).length,
      },
    ].filter((item) => item.value === 'all' || item.count > 0)
  )
  const clearFilters = () => {
    kind.value = 'all'
    query.value = ''
    filter.value = 'all'
    category.value = 'all'
  }
  const filter = ref<DishCatalogueState['filter']>(initial.filter)
  const view = ref<DishCatalogueState['layout']>(initial.layout)
  const catalogueQuery = computed(() =>
    dishCatalogueQuery({
      kind: kind.value,
      search: query.value,
      category: category.value,
      filter: filter.value,
      layout: view.value,
      page: page.value,
    })
  )
  const dishLink = (id: string) =>
    `${dishCataloguePath}/${encodeURIComponent(id)}?${new URLSearchParams(catalogueQuery.value)}`
  const normalize = (value: unknown) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  const filters = computed(
    () =>
      [
        { value: 'all', label: 'All', count: kindDishes.value.length },
        {
          value: 'image',
          label: 'Missing image',
          count: kindDishes.value.filter((d) => !d.image?.trim()).length,
        },
        {
          value: 'description',
          label: 'Missing description',
          count: kindDishes.value.filter((d) => !d.description?.trim()).length,
        },
      ] as const
  )
  const visibleDishes = computed(() =>
    kindDishes.value
      .filter(
        (dish) =>
          (category.value === 'all' ||
            (category.value === 'uncategorised'
              ? !dish.category
              : dish.category === category.value)) &&
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
  const pageDishes = computed(() =>
    visibleDishes.value.slice(
      (page.value - 1) * pageSize,
      page.value * pageSize
    )
  )
  watch([query, kind, category, filter], () => {
    page.value = 1
  })
  watch(
    [() => visibleDishes.value.length, outcome],
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
    visibleDishes,
    page,
    pageSize,
    pageDishes,
    dishLink,
    clearFilters,
  }
}

const catalogueKey: InjectionKey<ReturnType<typeof useDishCatalogue>> =
  Symbol('DishCatalogue')

export function provideDishCatalogue() {
  provide(catalogueKey, useDishCatalogue())
}

export function useDishCatalogueContext() {
  const catalogue = inject(catalogueKey)
  if (!catalogue) throw new Error('Items list requires its catalogue provider.')
  return catalogue
}
