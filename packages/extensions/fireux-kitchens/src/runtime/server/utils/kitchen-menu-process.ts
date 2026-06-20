import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

export type MenuProcessFlag = {
  code: string
  level: 'info' | 'warning' | 'error'
  message: string
  item?: string
  section?: string
}

export type ExtractedMenuItem = {
  name: string
  description: string
  price: number
  price_options: unknown[]
  source_file_ids: string[]
}

export type ExtractedMenuSection = {
  label: string
  items: ExtractedMenuItem[]
}

const text = (value: unknown) => String(value ?? '').trim()

export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const fileRows = (source: Record<string, unknown>) => {
  const files = Array.isArray(source.files) ? source.files.map(record) : []

  if (files.length) {
    return files.map((file, index) => ({
      id: text(file.id) || String(index + 1),
      file_name: text(file.file_name),
      file_type: text(file.file_type),
      file_kind: text(file.file_kind) || 'document',
      storage_path: text(file.storage_path),
      file_url: text(file.file_url),
      sort_order: numberValue(file.sort_order),
    }))
  }

  return text(source.storage_path)
    ? [
        {
          id: '1',
          file_name: text(source.file_name),
          file_type: text(source.file_type),
          file_kind: text(source.file_kind) || 'document',
          storage_path: text(source.storage_path),
          file_url: text(source.file_url),
          sort_order: 0,
        },
      ]
    : []
}

const menuRow = (menu: Record<string, unknown>, menuId: string) => ({
  id: text(menu.id) || menuId,
  name: text(menu.name),
  description: text(menu.description),
  status: text(menu.status),
  kitchen_id: text(menu.kitchen_id),
})

const sectionRow = (section: Record<string, unknown>, sectionId: string) => ({
  id: text(section.id) || sectionId,
  label: text(section.label),
  description: text(section.description),
  status: text(section.status),
  sort_order: numberValue(section.sort_order),
})

const itemRow = (
  item: Record<string, unknown>,
  itemId: string,
  dish: Record<string, unknown> | null
) => ({
  id: text(item.id) || itemId,
  dish_id: text(item.dish_id),
  name: text(dish?.name),
  description: text(dish?.description),
  price: numberValue(item.price),
  price_options: Array.isArray(item.price_options) ? item.price_options : [],
  status: text(item.status),
  sort_order: numberValue(item.sort_order),
})

const sortByOrderThenLabel = <T extends { sort_order: number }>(
  left: T,
  right: T
) => left.sort_order - right.sort_order

const active = (entry: { status: string }) => entry.status !== 'archived'

const normalizeKey = (value: unknown) =>
  text(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const money = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const normalized = text(value)
    .replace(/chf/ig, '')
    .replace(/[,]/g, '.')
    .match(/\d+(?:\.\d+)?/)

  return normalized ? numberValue(normalized[0]) : 0
}

export function normalizeExtractedSections(
  value: unknown
): ExtractedMenuSection[] {
  const source = record(value)
  const sections = Array.isArray(source.sections) ? source.sections : []

  return sections
    .map((section) => {
      const data = record(section)
      const items = Array.isArray(data.items) ? data.items : []

      return {
        label: text(data.label),
        items: items
          .map((item) => {
            const row = record(item)
            return {
              name: text(row.name),
              description: text(row.description),
              price: money(row.price),
              price_options: Array.isArray(row.price_options)
                ? row.price_options
                : [],
              source_file_ids: Array.isArray(row.source_file_ids)
                ? row.source_file_ids.map(text).filter(Boolean)
                : [],
            }
          })
          .filter((item) => item.name),
      }
    })
    .filter((section) => section.label || section.items.length)
}

export async function readCurrentMenuShape(
  basePath: string,
  menuId: string
) {
  const db = getRuntimeFirestore()
  const menuRef = db.doc(`${basePath}/menus/${menuId}`)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const dishesSnap = await db.collection(`${basePath}/dishes`).get()
  const dishesById = new Map(
    dishesSnap.docs.map((doc) => [doc.id, record({ ...doc.data(), id: doc.id })])
  )
  const sectionsSnap = await menuRef.collection('sections').get()
  const sections = await Promise.all(
    sectionsSnap.docs.map(async (sectionDoc) => {
      const section = sectionRow(sectionDoc.data(), sectionDoc.id)
      const itemsSnap = await sectionDoc.ref.collection('items').get()
      const items = itemsSnap.docs
        .map((itemDoc) => {
          const item = record({ ...itemDoc.data(), id: itemDoc.id })
          return itemRow(
            item,
            itemDoc.id,
            dishesById.get(text(item.dish_id)) ?? null
          )
        })
        .filter(active)
        .sort(sortByOrderThenLabel)

      return {
        ...section,
        items,
      }
    })
  )

  return {
    menu: menuRow(menuSnap.data() || {}, menuSnap.id),
    sections: sections.filter(active).sort(sortByOrderThenLabel),
  }
}

function flatCurrentItems(current: Awaited<ReturnType<typeof readCurrentMenuShape>>) {
  return current.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
    }))
  )
}

function flatExtractedItems(sections: ExtractedMenuSection[]) {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
    }))
  )
}

export function compareExtractedToCurrent(
  current: Awaited<ReturnType<typeof readCurrentMenuShape>>,
  extractedSections: ExtractedMenuSection[]
) {
  const flags: MenuProcessFlag[] = []
  const currentItems = flatCurrentItems(current)
  const extractedItems = flatExtractedItems(extractedSections)
  const currentByKey = new Map(currentItems.map((item) => [item.key, item]))
  const extractedByKey = new Map(extractedItems.map((item) => [item.key, item]))

  for (const item of currentItems) {
    if (!item.key || extractedByKey.has(item.key)) continue
    flags.push({
      code: 'missing-in-extraction',
      level: 'warning',
      message: `${item.name} exists in the current menu but was not found by AI.`,
      item: item.name,
      section: item.section,
    })
  }

  for (const item of extractedItems) {
    if (!item.key || currentByKey.has(item.key)) continue
    flags.push({
      code: 'new-in-extraction',
      level: 'info',
      message: `${item.name} was found by AI but is not in the current menu.`,
      item: item.name,
      section: item.section,
    })
  }

  for (const item of currentItems) {
    const extracted = extractedByKey.get(item.key)
    if (!extracted || !item.price || !extracted.price) continue
    if (Math.abs(item.price - extracted.price) < 0.05) continue

    flags.push({
      code: 'price-diff',
      level: 'warning',
      message: `${item.name} price differs: current ${item.price}, AI ${extracted.price}.`,
      item: item.name,
      section: item.section,
    })
  }

  return {
    flags,
    counts: {
      extracted_sections: extractedSections.length,
      extracted_items: extractedItems.length,
    },
  }
}
