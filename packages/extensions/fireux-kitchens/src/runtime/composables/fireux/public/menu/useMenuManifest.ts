import { computed, type MaybeRefOrGetter } from 'vue'
import { useMenuFetch } from './useMenuFetch'
import type { MenuPublicView } from '../../../../models/menu/menu.model'

type MenuManifestOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const menuViews = ['browse', 'order'] as const

const itemName = (item: Record<string, unknown>) =>
  text(item.name) || text(record(item.item).name)

const itemDescription = (item: Record<string, unknown>) =>
  text(item.description) || text(record(item.item).description)

const itemPriceLabel = (item: Record<string, unknown>) =>
  text(item.priceLabel) ||
  text(item.price_label) ||
  text(item.price)

const publicViews = (value: unknown): MenuPublicView[] =>
  list(value)
    .map(menuPublicView)
    .filter((view): view is MenuPublicView =>
      menuViews.includes(view as MenuPublicView)
    )

const menuPublicView = (value: unknown) => {
  const view = text(value)
  if (view === 'classic' || view === 'read') return 'browse'
  return view
}

export function useMenuManifest(
  menuId: MaybeRefOrGetter<string>,
  options: MenuManifestOptions = {}
) {
  const fetch = useMenuFetch(menuId, options)
  const renderMenu = computed(() => {
    const source = fetch.menu.value
    if (!source) return null

    const sourceRecord = record(source)

    return {
      id: source.id,
      name: text(source.name) || 'Menu',
      description: text(source.description),
      kitchenName:
        text(source.source?.kitchen_name) ||
        text(record(sourceRecord.kitchen).name),
      orderingEnabled: source.ordering_enabled === true,
      orderingModes: Array.isArray(source.ordering_modes)
        ? source.ordering_modes
        : [],
      publicViews: publicViews(source.public_views),
      pageStyle: source.page_style,
      sections: list(source.sections).map((section, sectionIndex) => {
        const sectionRecord = record(section)
        const nestedSection = record(sectionRecord.section)
        const label =
          text(sectionRecord.label) ||
          text(nestedSection.label) ||
          `Section ${sectionIndex + 1}`

        return {
          id: text(sectionRecord.id) || text(nestedSection.id) || label,
          label,
          items: list(sectionRecord.items).map((item, itemIndex) => {
            const itemRecord = record(item)
            const name = itemName(itemRecord) || `Item ${itemIndex + 1}`

            return {
              id: text(itemRecord.id) || name,
              dishId: text(itemRecord.dish_id),
              name,
              description: itemDescription(itemRecord),
              priceLabel: itemPriceLabel(itemRecord),
            }
          }),
        }
      }),
    }
  })
  const debug = computed(() => ({
    fetch: {
      menuId: fetch.id.value,
      kitchenSlug: fetch.kitchenSlug.value,
      pending: fetch.pending.value,
      hasError: Boolean(fetch.error.value),
      hasMenu: Boolean(fetch.menu.value),
    },
    derived: {
      sectionsCount: renderMenu.value?.sections.length || 0,
    },
    menu: fetch.menu.value,
    renderMenu: renderMenu.value,
  }))

  return {
    ...fetch,
    renderMenu,
    debug,
  }
}
