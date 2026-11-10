import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useDishEditorScope } from '../../dish/useDishEditorScope'
import { computed, ref, watch } from 'vue'
import type { useMenuSection } from '../../../../menu/composables/useMenuSection'
import { useDishCreate } from '../../dish/useDishCreate'

/** Create catalogue Dishes and place them through the existing Section owner. */
export function useMenuSectionDishCreation(
  context: Pick<
    ReturnType<typeof useMenuSection>,
    | 'kitchenId'
    | 'menuId'
    | 'sectionId'
    | 'dishSource'
    | 'activeItemRows'
    | 'canWrite'
    | 'createItem'
  >,
  routePath: () => string
) {
  const {
    kitchenId,
    menuId,
    sectionId,
    dishSource,
    activeItemRows,
    canWrite,
    createItem,
  } = context
  const names = ref('')
  const prices = ref<Record<string, string | number>>({})
  const {
    dishes,
    outcome: catalogueOutcome,
    error: catalogueError,
  } = dishSource
  const catalogueReady = computed(() =>
    ['ready', 'empty'].includes(catalogueOutcome.value)
  )
  const lines = computed(() => {
    const unique = new Map<string, string>()
    for (const line of names.value.split('\n')) {
      const name = line.trim()
      const key = name.toLocaleLowerCase()
      if (name && !unique.has(key)) unique.set(key, name)
    }
    return [...unique.values()]
  })

  // A Dish can be saved before its placement succeeds or its snapshot arrives.
  const awaitingCatalogue = ref(new Map<string, string>())
  watch(
    dishes,
    (rows) => {
      const ids = new Set(rows.map((dish) => dish.id))
      for (const [name, id] of awaitingCatalogue.value) {
        if (ids.has(id)) awaitingCatalogue.value.delete(name)
      }
    },
    { flush: 'sync' }
  )
  const knownDishes = computed(() => {
    const known = new Map(awaitingCatalogue.value)
    for (const dish of dishes.value)
      known.set(dish.name.toLocaleLowerCase(), dish.id)
    return known
  })
  const newNames = computed(() =>
    catalogueReady.value
      ? lines.value.filter(
          (name) => !knownDishes.value.has(name.toLocaleLowerCase())
        )
      : []
  )
  const error = ref('')
  const busy = ref(false)

  const ownerSources = [kitchenId, menuId, sectionId, routePath, canWrite]
  const captureOwner = useDishEditorScope(ownerSources, () => {
    awaitingCatalogue.value.clear()
    prices.value = {}
    names.value = ''
    error.value = ''
    busy.value = false
  })
  const draftSources = [
    catalogueReady,
    names,
    () => JSON.stringify(prices.value),
  ]
  const captureDraft = useCommandScope(draftSources)
  watch(
    draftSources,
    () => {
      error.value = ''
      busy.value = false
    },
    { flush: 'sync' }
  )
  const { createDish } = useDishCreate([...ownerSources, ...draftSources])
  async function addNames() {
    if (busy.value || !canWrite.value || !catalogueReady.value) return
    const ownerCurrent = captureOwner()
    const draftCurrent = captureDraft()
    const isCurrent = () => ownerCurrent() && draftCurrent()
    const target = {
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      sectionId: sectionId.value,
    }
    const requested = lines.value
    const requestedPrices = { ...prices.value }
    const knownAtSubmit = knownDishes.value
    const placed = new Set(activeItemRows.value.map((row) => row.dishId))
    busy.value = true
    error.value = ''
    try {
      if (requested.length > 30 || requested.some((name) => name.length > 160))
        throw new Error('Use up to 30 dish names, each under 160 characters.')
      for (const name of newNames.value) {
        const price = requestedPrices[name]
        if (
          price === undefined ||
          String(price).trim() === '' ||
          !Number.isFinite(Number(price)) ||
          Number(price) < 0
        )
          throw new Error(`Enter a normal price for ${name}.`)
      }
      for (const name of requested) {
        if (!isCurrent()) return
        const key = name.toLocaleLowerCase()
        let id = knownAtSubmit.get(key) ?? knownDishes.value.get(key)
        if (!id) {
          id = (
            await createDish(
              { name, price: Number(requestedPrices[name]) },
              { kitchenId: target.kitchenId }
            )
          ).id
          if (!isCurrent()) return
          if (!dishes.value.some((dish) => dish.id === id))
            awaitingCatalogue.value.set(key, id)
        }
        if (placed.has(id)) continue
        try {
          await createItem({ ...target, dishId: id }, isCurrent)
        } catch (cause) {
          if (!isCurrent()) return
          throw new Error(
            `Dish “${name}” exists, but adding it to this Menu failed. ${cause instanceof Error ? cause.message : String(cause)}`
          )
        }
        if (!isCurrent()) return
        placed.add(id)
      }
      prices.value = {}
      names.value = ''
    } catch (cause) {
      if (isCurrent())
        error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      if (isCurrent()) busy.value = false
    }
  }
  return {
    names,
    prices,
    newNames,
    error,
    busy,
    canWrite,
    catalogueReady,
    catalogueOutcome,
    catalogueError,
    addNames,
  }
}
