import { DishStorage } from '../../../models/kitchen/dish.model'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model'
import {
  MenuItemModel,
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../../models/kitchen/menu/menu-item.model'
import { MenuSectionModel } from '../../../models/kitchen/menu/menu-section.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import type { normalizeKitchenMenuDraftSections } from './sections'
import { ensureKitchenMenuRootEntry } from './root-entry'

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
  let itemCount = 0

  const menuData = {
    id: input.menuId,
    kitchen_id: input.kitchenId,
    name: text(existing.name) || titleFromId(input.menuId) || input.menuId,
    description: text(existing.description),
    status,
    sort_order: Number(existing.sort_order || 0),
    created: record(existing.created).at ? existing.created : stamp,
    updated: stamp,
  }

  writeBatch.set(menuRef, menuData)

  input.sections.forEach((section, sectionIndex) => {
    const sectionId = uniqueSlug(
      sectionIds,
      `section-${sectionIndex + 1}`,
      section.label
    )
    const sectionRef = menuRef.collection('sections').doc(sectionId)

    writeBatch.set(sectionRef, {
      ...MenuSectionModel,
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
      const addOns = normalizeMenuItemAddOns(item.add_ons)
      const priceOptions = normalizeMenuItemPriceOptions(item.price_options)
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
          description: text(item.description),
          item_kind: item.item_kind,
          is_deal: item.is_deal,
          kitchen_id: input.kitchenId,
          created: stamp,
          updated: stamp,
        },
        { merge: true }
      )
      writeBatch.set(sectionRef.collection('items').doc(itemId), {
        ...MenuItemModel,
        id: itemId,
        kitchen_id: input.kitchenId,
        menu_id: input.menuId,
        section_id: sectionId,
        dish_id: dishId,
        item_kind: item.item_kind,
        is_deal: item.is_deal,
        image_url: text(item.image_url),
        price,
        add_ons: addOns,
        price_options: priceOptions,
        status: 'active',
        sort_order: itemIndex,
        created: stamp,
        updated: stamp,
      })

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
  }
}
