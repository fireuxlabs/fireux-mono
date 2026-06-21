import { DishStorage } from '../../models/dish.model'
import { MenuStorage } from '../../models/menu/menu.model'
import {
  MenuItemModel,
  normalizeMenuItemPriceOptions,
} from '../../models/menu/menu-item.model'
import { MenuSectionModel } from '../../models/menu/menu-section.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import type { normalizeExtractedSections } from './kitchen-menu-process'

type DraftSections = ReturnType<typeof normalizeExtractedSections>

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
  const menuRef = db.doc(`${input.kitchenPath}/${MenuStorage.collection}/${input.menuId}`)
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

  writeBatch.set(menuRef, {
    id: input.menuId,
    kitchen_id: input.kitchenId,
    name: text(existing.name) || titleFromId(input.menuId) || input.menuId,
    description: text(existing.description),
    status,
    sort_order: Number(existing.sort_order || 0),
    created: record(existing.created).at ? existing.created : stamp,
    updated: stamp,
  })

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
        price,
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

  return {
    menu_written: true,
    action: menuSnap.exists ? 'replaced-draft' : 'created-draft',
    status,
    sections_count: input.sections.length,
    items_count: itemCount,
  }
}
