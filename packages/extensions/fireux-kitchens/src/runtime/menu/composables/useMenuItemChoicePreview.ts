import { computed, ref, watch } from 'vue'
import {
  readItemChoiceGroups,
  priceItemChoices,
} from '../../kitchen/utils/item-choices'
import type { ItemChoiceSelection } from '../../kitchen/records/menus/items/item-offer'

type ChoicePreviewItem = Parameters<typeof readItemChoiceGroups>[0] & {
  id: string
  dishId?: string
  price?: number
}

/** Local selections for display surfaces. Never writes to the catalogue. */
export function useMenuItemChoicePreview(
  readItem: () => ChoicePreviewItem,
  formatPrice: (price: number) => string,
  missingPrice = ''
) {
  const choiceGroups = computed(() => readItemChoiceGroups(readItem()))
  const selections = ref<ItemChoiceSelection>({})
  watch(
    [() => readItem().id, () => readItem().dishId, choiceGroups],
    (currentOwner, previousOwner) => {
      const sameItem =
        previousOwner &&
        currentOwner[0] === previousOwner[0] &&
        currentOwner[1] === previousOwner[1]
      const next: ItemChoiceSelection = {}
      for (const group of choiceGroups.value) {
        const current = (
          sameItem ? selections.value[group.id] || [] : []
        ).filter((id) => group.options.some((option) => option.id === id))
        const cheapest =
          group.pricing === 'full'
            ? group.options.reduce((a, b) => (a.price <= b.price ? a : b))
            : undefined
        next[group.id] = current.length
          ? current
          : cheapest
            ? [cheapest.id]
            : []
      }
      selections.value = next
    },
    { immediate: true, flush: 'sync' }
  )
  const itemPrice = computed(() => {
    const base = readItem().price
    if (base === undefined) return missingPrice
    try {
      return formatPrice(
        priceItemChoices(base, choiceGroups.value, selections.value, true)
          .unitMinor / 100
      )
    } catch {
      return formatPrice(base)
    }
  })

  return { choiceGroups, selections, itemPrice }
}
