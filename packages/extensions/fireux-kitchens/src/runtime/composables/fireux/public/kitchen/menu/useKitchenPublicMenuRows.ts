import { computed, type Ref } from 'vue'
import { resolveSproochliTranslatedText } from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'
import type { Dish } from '../../../../../models/dish.model'
import type { MenuItem, MenuSection } from '../../../../../models/menu.model'
import type { KitchenPublicMenuSectionRow } from './types'

type MenuRowOptions = {
  sections: Ref<MenuSection[]>
  items: Ref<MenuItem[]>
  dishesById: Ref<Map<string, Dish>>
  selectedLanguage: Ref<unknown>
  textFor: (fieldId: string) => string
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const translatedText = (
  defaultText: unknown,
  translations: unknown,
  selectedLanguage: unknown,
  cacheText?: unknown
) =>
  resolveSproochliTranslatedText({
    defaultText,
    translations,
    selectedLanguage,
    cacheText,
  }).text

export function useKitchenPublicMenuRows(options: MenuRowOptions) {
  const itemsBySectionId = computed(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of options.items.value) {
      const sectionId = text(item.section_id)
      if (!sectionId) continue
      map.set(sectionId, [...(map.get(sectionId) ?? []), item])
    }
    return map
  })

  const sectionRows = computed<KitchenPublicMenuSectionRow[]>(() =>
    options.sections.value.map((section) => {
      const sectionId = text(section.id)
      const items = itemsBySectionId.value.get(sectionId) ?? []

      return {
        id: sectionId,
        section,
        label:
          translatedText(
            section.label,
            record(section).labels ?? record(section).translations,
            options.selectedLanguage.value,
            options.textFor(`section:${sectionId}:label`)
          ) || text(section.label),
        description:
          translatedText(
            section.description,
            record(section).descriptions,
            options.selectedLanguage.value,
            options.textFor(`section:${sectionId}:description`)
          ) || text(section.description),
        items: items.map((item) => {
          const dishId = text(item.dish_id)
          const dish = options.dishesById.value.get(dishId) ?? null
          return {
            id: text(item.id),
            item,
            dish,
            name:
              translatedText(
                dish?.name,
                record(dish).names,
                options.selectedLanguage.value,
                options.textFor(`dish:${dishId}:name`)
              ) || dishId,
            description: translatedText(
              dish?.description,
              record(dish).descriptions,
              options.selectedLanguage.value,
              options.textFor(`dish:${dishId}:description`)
            ),
            price: Number(item.price || 0),
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
