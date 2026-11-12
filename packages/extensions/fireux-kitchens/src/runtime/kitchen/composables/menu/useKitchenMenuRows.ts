import {
  normalizeItemPriceOptions,
  normalizeItemAddOns,
} from '../../utils/item-pricing'
// Concurrent edit — 2026-07-22 01:58 CEST — Item/MenuItem boundary: derive row media only from its Item.
import { computed, type Ref } from 'vue'
import type { Item } from '../../utils/item.ts'
import { type MenuItem } from '../../../menu/models/menu-item.model.ts'
import type { MenuSection } from '../../../menu/models/menu-section.model.ts'
import type { KitchenMenuSectionRow } from '../../models/kitchen-menu-rows.model'

type MenuRowOptions = {
  sections: Ref<MenuSection[]>
  items: Ref<MenuItem[]>
  dishesById: Ref<Map<string, Item>>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function useKitchenMenuRows(options: MenuRowOptions) {
  const itemsBySectionId = computed(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of options.items.value) {
      const sectionId = text(item.section_id)
      if (!sectionId) continue
      map.set(sectionId, [...(map.get(sectionId) ?? []), item])
    }
    return map
  })

  const sectionRows = computed<KitchenMenuSectionRow[]>(() =>
    options.sections.value.map((section) => {
      const sectionId = text(section.id)
      const items = itemsBySectionId.value.get(sectionId) ?? []

      return {
        id: sectionId,
        section,
        label: text(section.label),
        description: text(section.description),
        items: items.map((item) => {
          const dishId = text(item.dish_id)
          const dish = options.dishesById.value.get(dishId) ?? null
          return {
            id: text(item.id),
            dish_id: dishId,
            item,
            dish,
            name: text(dish?.name) || dishId,
            description: text(dish?.description),
            image_url: text(record(dish).image),
            price: dish?.price,
            ...(dish?.price === undefined
              ? { priceLabel: 'Price not set' }
              : {}),
            addOns: normalizeItemAddOns(record(dish).add_ons),
            priceOptions: normalizeItemPriceOptions(record(dish).price_options),
          }
        }),
      }
    })
  )

  return {
    itemsBySectionId,
    sectionRows,
  }
}
