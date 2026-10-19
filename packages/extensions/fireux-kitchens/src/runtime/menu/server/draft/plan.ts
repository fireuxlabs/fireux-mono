import { createHash } from 'node:crypto'
import {
  normalizeDishPriceOptions,
  normalizeDishAddOns,
} from '../../../kitchen/utils/dish-pricing'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import type {
  KitchenMenuDraftTranslation,
  KitchenMenuDraftSection,
} from './sections'
import { appendKitchenMenuCacheUnits } from '../sproochli/cache-import'
import type { SproochliMenuCacheImportUnit } from 'fireux-sproochli/runtime/menu-cache'
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const fieldSegment = (value: unknown) =>
  text(value).replace(/[^A-Za-z0-9_-]+/g, '-') || 'unknown'
const uniqueSlug = (used: Set<string>, fallback: string, seed: unknown) => {
  const base = normalizeSlug(seed) || fallback
  let id = base
  let index = 2

  while (used.has(id)) {
    id = `${base}-${index}`
    index += 1
  }

  used.add(id)
  return id
}

export function planKitchenMenuDraft(
  input: {
    kitchenId: string
    menuId: string
    sections: KitchenMenuDraftSection[]
  },
  stamp: ReturnType<typeof serverAuditStamp>
) {
  const sectionIds = new Set<string>()
  const dishIds = new Set<string>()
  const sproochliCacheUnits: SproochliMenuCacheImportUnit[] = []
  const plannedSections = input.sections.map((section, sectionIndex) => {
    const sectionId = uniqueSlug(
      sectionIds,
      `section-${sectionIndex + 1}`,
      section.label
    )
    appendKitchenMenuCacheUnits(sproochliCacheUnits, {
      fieldId: `section:${sectionId}:label`,
      sourceText: section.label,
      translations: section.label_translations,
    })

    const items = section.items.map((item, itemIndex) => {
      const dishKey = uniqueSlug(
        dishIds,
        `dish-${sectionIndex + 1}-${itemIndex + 1}`,
        item.name
      )
      // A source creates its own Dishes; a matching catalogue name is not identity.
      const dishId = createHash('sha256')
        .update(JSON.stringify([input.menuId, dishKey]))
        .digest('hex')
        .slice(0, 32)
      const itemId = `${dishId}-${itemIndex + 1}`
      const itemKey = `dish:${fieldSegment(sectionId)}__${fieldSegment(itemId)}`
      const addOns = normalizeDishAddOns(item.add_ons)
      const priceOptions = normalizeDishPriceOptions(item.price_options)
      appendKitchenMenuCacheUnits(sproochliCacheUnits, {
        fieldId: `${itemKey}:name`,
        sourceText: item.name,
        translations: item.name_translations,
      })
      appendKitchenMenuCacheUnits(sproochliCacheUnits, {
        fieldId: `${itemKey}:description`,
        sourceText: item.description,
        translations: item.description_translations,
      })
      item.price_options.forEach((option, optionIndex) => {
        const source = record(option)
        const normalized = priceOptions[optionIndex]
        if (!normalized) return
        const optionId =
          normalizeSlug(normalized.label) || `option-${optionIndex + 1}`
        appendKitchenMenuCacheUnits(sproochliCacheUnits, {
          fieldId: `${itemKey}:price-option:${optionId}:label`,
          sourceText: normalized.label,
          translations: Array.isArray(source.label_translations)
            ? (source.label_translations as KitchenMenuDraftTranslation[])
            : [],
        })
      })
      item.add_ons.forEach((option, optionIndex) => {
        const source = record(option)
        const normalized = addOns[optionIndex]
        if (!normalized) return
        appendKitchenMenuCacheUnits(sproochliCacheUnits, {
          fieldId: `${itemKey}:add-on:${normalized.id}:label`,
          sourceText: normalized.label,
          translations: Array.isArray(source.label_translations)
            ? (source.label_translations as KitchenMenuDraftTranslation[])
            : [],
        })
      })
      const optionPrices = priceOptions
        .map((option) => option.price)
        .filter((price) => price > 0)
      const price = Math.max(
        0,
        Number(item.price || 0) ||
          (optionPrices.length ? Math.min(...optionPrices) : 0)
      )

      return {
        itemId,
        dishId,
        dishData: {
          id: dishId,
          price,
          price_options: priceOptions,
          add_ons: addOns,
          name: text(item.name),
          slug: dishId,
          item_kind: item.item_kind,
          kitchen_id: input.kitchenId,
          created: stamp,
          updated: stamp,
          ...(text(item.description)
            ? { description: text(item.description) }
            : {}),
        },
        itemData: {
          id: itemId,
          kitchen_id: input.kitchenId,
          menu_id: input.menuId,
          section_id: sectionId,
          dish_id: dishId,
          status: 'active',
          sort_order: itemIndex,
          created: stamp,
          updated: stamp,
        } as Record<string, unknown>,
      }
    })
    return {
      sectionId,
      sectionData: {
        id: sectionId,
        kitchen_id: input.kitchenId,
        menu_id: input.menuId,
        label: text(section.label) || `Section ${sectionIndex + 1}`,
        status: 'active',
        sort_order: sectionIndex,
        created: stamp,
        updated: stamp,
      },
      items,
    }
  })
  return { plannedSections, sproochliCacheUnits }
}
