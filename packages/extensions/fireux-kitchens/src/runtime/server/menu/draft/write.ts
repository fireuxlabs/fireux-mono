// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: preserve Menu operations on reconfirm and omit absent catalogue fields.
// Concurrent edit — 2026-07-22 01:58 CEST — Dish/MenuItem boundary: never persist a source image candidate on MenuItem.
import { DishStorage } from '../../../models/kitchen/dish.model'
import { KitchenMenuStorage as MenuStorage } from '../../../models/kitchen/menu/kitchen-menu.model'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../../models/kitchen/menu/menu-item.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import type {
  KitchenMenuDraftTranslation,
  normalizeKitchenMenuDraftSections,
} from './sections'
import { ensureKitchenMenuRootEntry } from './root-entry'
import {
  appendKitchenMenuCacheUnits,
} from '../sproochli/cache-import'
import type {
  SproochliMenuCacheImportUnit,
} from 'fireux-sproochli/runtime/menu-cache.ts'

type DraftSections = ReturnType<typeof normalizeKitchenMenuDraftSections>

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const titleFromId = (value: string) =>
  value
    .split(/[-_\s]+/g)
    .map((part) => part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : '')
    .filter(Boolean)
    .join(' ')
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

export async function writeKitchenMenuDraft(input: {
  appId: string
  kitchenId: string
  kitchenPath: string
  menuId: string
  uid: string
  sections: DraftSections
  status?: string
}) {
  const db = getRuntimeFirestore()
  const menuRef = db.doc(`${input.kitchenPath}/${MenuStorage.scopeCollection}/${input.menuId}`)
  const menuSnap = await menuRef.get()
  const oldSectionsSnap = await menuRef.collection('sections').get()
  const deleteBatch = db.batch()
  let deleteCount = 0

  for (const sectionDoc of oldSectionsSnap.docs) {
    const itemsSnap = await sectionDoc.ref.collection('items').get()
    itemsSnap.docs.forEach((itemDoc) => {
      deleteBatch.delete(itemDoc.ref)
      deleteCount += 1
    })
    deleteBatch.delete(sectionDoc.ref)
    deleteCount += 1
  }

  if (deleteCount) await deleteBatch.commit()

  const writeBatch = db.batch()
  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const existing = record(menuSnap.data() || {})
  const status = text(input.status) || text(existing.status) || 'draft'
  const sectionIds = new Set<string>()
  const dishIds = new Set<string>()
  const sproochliCacheUnits: SproochliMenuCacheImportUnit[] = []
  let itemCount = 0

  const description = text(existing.description)
  const menuData: Record<string, unknown> = {
    id: input.menuId,
    kitchen_id: input.kitchenId,
    name: text(existing.name) || titleFromId(input.menuId) || input.menuId,
    status,
    sort_order: Number(existing.sort_order || 0),
    created: record(existing.created).at ? existing.created : stamp,
    updated: stamp,
    ...(description ? { description } : {}),
  }

  // Catalogue confirmation owns catalogue fields only. Ordering and surface
  // policy remain on the existing KitchenMenu document.
  writeBatch.set(menuRef, menuData, { merge: true })

  input.sections.forEach((section, sectionIndex) => {
    const sectionId = uniqueSlug(
      sectionIds,
      `section-${sectionIndex + 1}`,
      section.label
    )
    const sectionRef = menuRef.collection('sections').doc(sectionId)
    appendKitchenMenuCacheUnits(sproochliCacheUnits, {
      fieldId: `section:${sectionId}:label`,
      sourceText: section.label,
      translations: section.label_translations,
    })

    writeBatch.set(sectionRef, {
      id: sectionId,
      kitchen_id: input.kitchenId,
      menu_id: input.menuId,
      label: text(section.label) || `Section ${sectionIndex + 1}`,
      status: 'active',
      sort_order: sectionIndex,
      created: stamp,
      updated: stamp,
    })

    section.items.forEach((item, itemIndex) => {
      const dishId = uniqueSlug(
        dishIds,
        `dish-${sectionIndex + 1}-${itemIndex + 1}`,
        item.name
      )
      const dishRef = db.doc(`${input.kitchenPath}/${DishStorage.collection}/${dishId}`)
      const itemId = `${dishId}-${itemIndex + 1}`
      const itemKey =
        `dish:${fieldSegment(sectionId)}__${fieldSegment(itemId)}`
      const addOns = normalizeMenuItemAddOns(item.add_ons)
      const priceOptions = normalizeMenuItemPriceOptions(item.price_options)
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
            ? source.label_translations as KitchenMenuDraftTranslation[]
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
            ? source.label_translations as KitchenMenuDraftTranslation[]
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

      writeBatch.set(
        dishRef,
        {
          id: dishId,
          name: text(item.name),
          slug: dishId,
          item_kind: item.item_kind,
          is_deal: item.is_deal,
          kitchen_id: input.kitchenId,
          created: stamp,
          updated: stamp,
          ...(text(item.description)
            ? { description: text(item.description) }
            : {}),
        },
        { merge: true }
      )
      const itemData: Record<string, unknown> = {
        id: itemId,
        kitchen_id: input.kitchenId,
        menu_id: input.menuId,
        section_id: sectionId,
        dish_id: dishId,
        price,
        status: 'active',
        sort_order: itemIndex,
        created: stamp,
        updated: stamp,
        ...(addOns.length ? { add_ons: addOns } : {}),
        ...(priceOptions.length ? { price_options: priceOptions } : {}),
      }
      writeBatch.set(sectionRef.collection('items').doc(itemId), itemData)

      itemCount += 1
    })
  })

  await writeBatch.commit()
  // Public menu index seam: scoped menu content must also have a root /menus row.
  const root = await ensureKitchenMenuRootEntry(db, {
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenPath: input.kitchenPath,
    menuId: input.menuId,
    menuData,
    stamp,
  })

  return {
    menu_written: true,
    root_menu_id: root.id,
    root_menu_path: root.path,
    action: menuSnap.exists ? 'replaced-draft' : 'created-draft',
    status,
    sections_count: input.sections.length,
    items_count: itemCount,
    sproochliCacheUnits,
  }
}
