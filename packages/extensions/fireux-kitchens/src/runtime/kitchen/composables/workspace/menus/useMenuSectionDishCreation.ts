import { useDishEditorScope } from '../../dish/useDishEditorScope'
import { computed, ref } from 'vue'
import type { useMenuSection } from '../../../../menu/composables/useMenuSection'
import { useDishCreate } from '../../dish/useDishCreate'

/** Create catalogue Dishes and place them through the existing Section owner. */
export function useMenuSectionDishCreation(
  context: Pick<
    ReturnType<typeof useMenuSection>,
    | 'kitchenId'
    | 'menuId'
    | 'sectionId'
    | 'dishes'
    | 'itemRows'
    | 'canWrite'
    | 'createItem'
  >,
  routePath: () => string
) {
  const {
    kitchenId,
    menuId,
    sectionId,
    dishes,
    itemRows,
    canWrite,
    createItem,
  } = context
  const names = ref('')
  const prices = ref<Record<string, string | number>>({})
  const newNames = computed(() =>
    [
      ...new Set(
        names.value
          .split('\n')
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ].filter(
      (name) =>
        !dishes.value.some(
          (dish) => dish.name.toLocaleLowerCase() === name.toLocaleLowerCase()
        )
    )
  )
  const error = ref('')
  const busy = ref(false)

  useDishEditorScope([kitchenId, menuId, sectionId, routePath], () => {
    prices.value = {}
    names.value = ''
    error.value = ''
    busy.value = false
  })
  const ownerSources = [
    kitchenId,
    menuId,
    sectionId,
    routePath,
    names,
    () => JSON.stringify(prices.value),
  ]
  const captureScope = useDishEditorScope(ownerSources, () => {
    error.value = ''
    busy.value = false
  })
  const { createDish } = useDishCreate([...ownerSources, canWrite])
  async function addNames() {
    if (busy.value || !canWrite.value) return
    const isCurrent = captureScope()
    const target = {
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      sectionId: sectionId.value,
    }
    const lines = [
      ...new Set(
        names.value
          .split('\n')
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ]
    const requestedPrices = { ...prices.value }
    const known = new Map(
      dishes.value.map((dish) => [dish.name.toLocaleLowerCase(), dish.id])
    )
    const placed = new Set(itemRows.value.map((row) => row.dishId))
    busy.value = true
    error.value = ''
    try {
      if (lines.length > 30 || lines.some((name) => name.length > 160))
        throw new Error('Use up to 30 dish names, each under 160 characters.')
      for (const name of lines.filter(
        (name) => !known.has(name.toLocaleLowerCase())
      )) {
        const price = requestedPrices[name]
        if (
          price === undefined ||
          String(price).trim() === '' ||
          !Number.isFinite(Number(price)) ||
          Number(price) < 0
        )
          throw new Error(`Enter a normal price for ${name}.`)
      }
      for (const name of lines) {
        if (!isCurrent()) return
        let id = known.get(name.toLocaleLowerCase())
        if (!id) {
          id = (
            await createDish(
              { name, price: Number(requestedPrices[name]) },
              { kitchenId: target.kitchenId }
            )
          ).id
          if (!isCurrent()) return
          known.set(name.toLocaleLowerCase(), id)
        }
        if (placed.has(id)) continue
        try {
          await createItem({ ...target, dishId: id })
        } catch (cause) {
          if (!isCurrent()) return
          throw new Error(
            `Dish “${name}” exists, but adding it to this Menu failed. Retry after the catalogue refreshes to reuse it. ${cause instanceof Error ? cause.message : String(cause)}`
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
  return { names, prices, newNames, error, busy, canWrite, addNames }
}
