import { computed, type MaybeRefOrGetter } from 'vue'
import { useMenuFetch, type PublicMenu } from './useMenuFetch'
import type { MenuView } from '../../../../models/menu/menu.model'
import type { KitchenOrderType } from '../../../../models/order.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'

type MenuManifestOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

// Public menu detail spine: docs/concepts/family-menu.md. useMenuFetch owns retrieval; this composable classifies the public surface and prepares only the data a renderer needs.
export type MenuManifestItem = {
  id: string
  dishId: string
  name: string
  description: string
  priceLabel: string
}

export type MenuManifestSection = {
  id: string
  label: string
  items: MenuManifestItem[]
}

export type MenuManifestSurface = 'source' | 'structured' | 'unavailable'

export type MenuManifestContent = {
  id: string
  name: string
  description: string
  sections: MenuManifestSection[]
}

export type MenuManifestBehaviour = {
  orderingEnabled: boolean
  orderingModes: KitchenOrderType[]
  views: MenuView[]
}

export type MenuManifestPresentation = {
  kitchenName: string
  pageStyle?: Partial<PageStyle>
}

export type MenuManifest = {
  surface: 'structured'
  content: MenuManifestContent
  behaviour: MenuManifestBehaviour
  presentation: MenuManifestPresentation
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

const menuViewList = (value: unknown): MenuView[] =>
  list(value)
    .map(menuPublicView)
    .filter((view): view is MenuView =>
      menuViews.includes(view as MenuView)
    )

const menuPublicView = (value: unknown) => {
  const view = text(value)
  if (view === 'classic' || view === 'read') return 'browse'
  return view
}

const menuSections = (source: PublicMenu): MenuManifestSection[] =>
  list(source.sections).map((section, sectionIndex) => {
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
  })

const structuredMenuManifest = (source: PublicMenu): MenuManifest => {
  const sourceRecord = record(source)

  return {
    surface: 'structured',
    content: {
      id: source.id,
      name: text(source.name) || 'Menu',
      description: text(source.description),
      sections: menuSections(source),
    },
    behaviour: {
      orderingEnabled: source.ordering_enabled === true,
      orderingModes: Array.isArray(source.ordering_modes)
        ? source.ordering_modes
        : [],
      views: menuViewList(source.public_views),
    },
    presentation: {
      kitchenName:
        text(source.source?.kitchen_name) ||
        text(record(sourceRecord.kitchen).name),
      pageStyle: source.page_style,
    },
  }
}

export function useMenuManifest(
  menuId: MaybeRefOrGetter<string>,
  options: MenuManifestOptions = {}
) {
  const fetch = useMenuFetch(menuId, options)
  const surface = computed<MenuManifestSurface>(() => {
    if (!fetch.menu.value) return 'unavailable'
    return fetch.menu.value.kind === 'doc' ? 'source' : 'structured'
  })
  const sourceMenu = computed(() =>
    surface.value === 'source' ? fetch.menu.value : null
  )
  const structuredMenu = computed<MenuManifest | null>(() => {
    const source = fetch.menu.value
    if (!source || surface.value !== 'structured') return null

    return structuredMenuManifest(source)
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
      surface: surface.value,
      sectionsCount: structuredMenu.value?.content.sections.length || 0,
    },
    menu: fetch.menu.value,
    sourceMenu: sourceMenu.value,
    structuredMenu: structuredMenu.value,
  }))

  return {
    ...fetch,
    surface,
    sourceMenu,
    structuredMenu,
    debug,
  }
}
