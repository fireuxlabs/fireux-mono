import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  watch,
  type InjectionKey,
} from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/workspace/models/capability-context'
import { useKitchenWorkspaceItems } from './useKitchenWorkspaceItems'

export type KitchenItemCatalogueKind = 'all' | 'food' | 'drink'

const catalogueByKind = {
  all: {
    itemKind: 'all',
    singular: 'item',
    plural: 'items',
    title: 'Items',
    path: '/workspace/kitchen/menu/items',
    icon: 'i-lucide-utensils',
  },
  food: {
    itemKind: 'food',
    singular: 'dish',
    plural: 'dishes',
    title: 'Items',
    path: '/workspace/kitchen/menu/items',
    icon: 'i-lucide-cooking-pot',
  },
  drink: {
    itemKind: 'drink',
    singular: 'drink',
    plural: 'drinks',
    title: 'Drinks',
    path: '/workspace/kitchen/menu/items',
    icon: 'i-lucide-glass-water',
  },
} as const

export type KitchenItemsContext = ReturnType<typeof createKitchenItemsWorkspace>

const kitchenItemsWorkspaceKey: InjectionKey<KitchenItemsContext> = Symbol(
  'KitchenItemsContext'
)

function createKitchenItemsWorkspace(itemKind: KitchenItemCatalogueKind) {
  const source = useKitchenWorkspaceItems()
  const catalogue = catalogueByKind[itemKind]
  const pageState = useWorkspacePageState('kitchen')
  const selectedItemId = ref('')
  const dishes = computed(() =>
    source.dishes.value.filter((dish) =>
      itemKind === 'all' ? true : dish.item_kind === itemKind
    )
  )
  const outcome = computed(() =>
    source.outcome.value === 'ready'
      ? dishes.value.length
        ? 'ready'
        : 'empty'
      : source.outcome.value
  )
  const selectedItem = computed(
    () => dishes.value.find((dish) => dish.id === selectedItemId.value) ?? null
  )
  const state = computed(() => ({
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      image: dish.image,
    })),
    selectedItemId: selectedItemId.value,
  }))
  const derived = computed(() => {
    const status =
      outcome.value === 'error'
        ? 'error'
        : outcome.value === 'pending'
          ? 'loading'
          : outcome.value === 'ready'
            ? 'ready'
            : 'empty'

    return {
      status: status as 'loading' | 'error' | 'empty' | 'ready',
      capability: defineWorkspaceCapabilityContext({
        id: `kitchen.${itemKind === 'drink' ? 'drinks' : 'dishes'}`,
        subject: itemKind === 'drink' ? 'Drink' : 'Item',
        primitives: {
          create: {
            available:
              !source.readOnly.value &&
              Boolean(source.storageKitchenId.value) &&
              ['ready', 'empty'].includes(outcome.value),
            limit: null,
          },
          read: {
            available: dishes.value.length > 0,
            count: dishes.value.length,
          },
          update: { available: false },
          delete: { available: false },
        },
        natives: [],
      }),
    }
  })

  function select(dishId: string) {
    selectedItemId.value = dishes.value.some((dish) => dish.id === dishId)
      ? dishId
      : ''
  }

  watch(
    source.kitchenId,
    () => {
      selectedItemId.value = ''
    },
    { flush: 'sync' }
  )
  watchEffect(() => {
    if (!['ready', 'empty'].includes(outcome.value)) return
    if (selectedItem.value) return
    selectedItemId.value = dishes.value[0]?.id || ''
  })

  watchEffect(() => {
    pageState.publish({
      [itemKind === 'drink' ? 'drinks' : 'dishes']: state.value.dishes,
      selectedItemId: state.value.selectedItemId,
      derived: derived.value,
    })
  })

  return {
    ...source,
    dishes,
    outcome,
    selectedItem,
    selectedItemId,
    state,
    derived,
    actions: { select },
    catalogue,
  }
}

export function provideKitchenItemsContext(
  itemKind: KitchenItemCatalogueKind = 'food'
) {
  const workspace = createKitchenItemsWorkspace(itemKind)
  provide(kitchenItemsWorkspaceKey, workspace)
  return workspace
}

export function useKitchenItemsContext() {
  const workspace = inject(kitchenItemsWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Items workspace is not available')
  }

  return workspace
}
