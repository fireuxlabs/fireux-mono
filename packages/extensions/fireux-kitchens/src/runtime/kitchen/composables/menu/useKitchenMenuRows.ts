// Concurrent edit — 2026-07-22 01:58 CEST — Dish/MenuItem boundary: derive row media only from its Dish.
import { computed, type Ref } from 'vue'
import type { Dish } from '../../utils/dish.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
} from '../../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../../menu/utils/menu-section.ts'
import type { KitchenMenuSectionRow } from './types'

type MenuRowOptions = {
  sections: Ref<MenuSection[]>
  items: Ref<MenuItem[]>
  dishesById: Ref<Map<string, Dish>>
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
            price: Number(item.price || 0),
            addOns: normalizeMenuItemAddOns(record(item).add_ons),
            priceOptions: normalizeMenuItemPriceOptions(
              record(item).price_options
            ),
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
