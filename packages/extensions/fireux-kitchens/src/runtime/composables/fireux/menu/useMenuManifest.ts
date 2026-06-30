import { computed, type MaybeRefOrGetter } from 'vue'
import { useMenuFetch, type PublicMenu } from './useMenuFetch'
import { resolveMenuServiceProfile } from './useMenuServiceProfile'
import type { MenuServiceProfile } from '../../../models/menu/menu.model'
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
  imageUrl: string
  price: number
  priceLabel: string
  priceOptions: MenuManifestPriceOption[]
  addOns: MenuManifestAddOn[]
}

export type MenuManifestPriceOption = {
  id: string
  label: string
  price: number
  priceLabel: string
}

export type MenuManifestAddOn = {
  id: string
  label: string
  price: number
  priceLabel: string
}

export type MenuManifestSection = {
  id: string
  label: string
  items: MenuManifestItem[]
}

export type MenuRenderKind = 'document' | 'structured' | 'unavailable'

export type MenuManifestContent = {
  id: string
  name: string
  description: string
  sections: MenuManifestSection[]
}

export type MenuManifestBehaviour = MenuServiceProfile

export type MenuManifestPresentation = {
  kitchenName: string
  pageStyle?: Partial<PageStyle>
}

export type MenuManifest = {
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
const itemName = (item: Record<string, unknown>) =>
  text(item.name) || text(record(item.item).name)

const itemDescription = (item: Record<string, unknown>) =>
  text(item.description) || text(record(item.item).description)

const itemImageUrl = (item: Record<string, unknown>) =>
  text(item.imageUrl) ||
  text(item.image_url) ||
  text(record(item.item).image_url) ||
  text(record(item.dish).image_url)

const itemPriceLabel = (item: Record<string, unknown>) =>
  text(item.priceLabel) ||
  text(item.price_label) ||
  text(item.price)
const priceNumber = (value: unknown) => {
  const parsed = Number(
    text(value)
      .replace(/chf/ig, '')
      .replace(',', '.')
      .match(/\d+(?:\.\d+)?/)?.[0] || 0
  )

  return Number.isFinite(parsed) ? parsed : 0
}
const optionId = (
  option: Record<string, unknown>,
  fallback: string
) =>
  text(option.id) ||
  text(option.label).toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
  fallback
const itemPriceOptions = (item: Record<string, unknown>) =>
  list(item.priceOptions || item.price_options)
    .map((option, optionIndex) => {
      const optionRecord = record(option)
      const price = priceNumber(optionRecord.price)

      return {
        id: optionId(optionRecord, `option-${optionIndex + 1}`),
        label: text(optionRecord.label) || `Option ${optionIndex + 1}`,
        price,
        priceLabel:
          text(optionRecord.priceLabel) ||
          text(optionRecord.price_label) ||
          (price ? String(price) : ''),
      }
    })
    .filter((option) => option.label && option.priceLabel)
const itemAddOns = (item: Record<string, unknown>) =>
  list(item.addOns || item.add_ons)
    .map((option, optionIndex) => {
      const optionRecord = record(option)
      const price = priceNumber(optionRecord.price)

      return {
        id: optionId(optionRecord, `add-on-${optionIndex + 1}`),
        label: text(optionRecord.label) || `Add-on ${optionIndex + 1}`,
        price,
        priceLabel:
          text(optionRecord.priceLabel) ||
          text(optionRecord.price_label) ||
          (price ? String(price) : ''),
      }
    })
    .filter((option) => option.label && option.priceLabel)

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
          imageUrl: itemImageUrl(itemRecord),
          price: priceNumber(itemRecord.price),
          priceLabel: itemPriceLabel(itemRecord),
          priceOptions: itemPriceOptions(itemRecord),
          addOns: itemAddOns(itemRecord),
        }
      }),
    }
  })

const structuredMenuManifest = (source: PublicMenu): MenuManifest => {
  const sourceRecord = record(source)

  return {
    content: {
      id: source.id,
      name: text(source.name) || 'Menu',
      description: text(source.description),
      sections: menuSections(source),
    },
    behaviour: resolveMenuServiceProfile(source),
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
  const renderKind = computed<MenuRenderKind>(() => {
    if (!fetch.menu.value) return 'unavailable'
    return fetch.menu.value.kind === 'doc' ? 'document' : 'structured'
  })
  const documentMenu = computed(() =>
    renderKind.value === 'document' ? fetch.menu.value : null
  )
  const structuredMenu = computed<MenuManifest | null>(() => {
    const source = fetch.menu.value
    if (!source || renderKind.value !== 'structured') return null

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
      renderKind: renderKind.value,
      sectionsCount: structuredMenu.value?.content.sections.length || 0,
    },
    menu: fetch.menu.value,
    documentMenu: documentMenu.value,
    structuredMenu: structuredMenu.value,
  }))

  return {
    ...fetch,
    renderKind,
    documentMenu,
    structuredMenu,
    debug,
  }
}
