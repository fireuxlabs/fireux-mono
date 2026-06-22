import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  normalizeMenuItemPriceOptions,
} from '../../models/menu/menu-item.model'

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
  price_options: normalizeMenuItemPriceOptions(item.price_options),
  status: text(item.status),
  sort_order: numberValue(item.sort_order),
})

const sortByOrder = <T extends { sort_order: number }>(
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

const wordSet = (value: string) => new Set(
  normalizeKey(value).split(/\s+/g).filter((word) => word.length > 2)
)

const overlapScore = (left: string, right: string) => {
  const leftWords = wordSet(left)
  const rightWords = wordSet(right)
  if (!leftWords.size || !rightWords.size) return 0

  let overlap = 0
  for (const word of leftWords) if (rightWords.has(word)) overlap += 1
  return (overlap * 2) / (leftWords.size + rightWords.size)
}

const sameSection = (left: string, right: string) =>
  normalizeKey(left) === normalizeKey(right)

const similarEnough = (
  current: ReturnType<typeof flatCurrentItems>[number],
  extracted: ReturnType<typeof flatExtractedItems>[number]
) => {
  const score = overlapScore(current.name, extracted.name)
  const samePrice = Boolean(
    current.price &&
      extracted.price &&
      Math.abs(current.price - extracted.price) < 0.05
  )

  return sameSection(current.section, extracted.section) &&
    (score >= 0.55 || (samePrice && score >= 0.25))
}

const pairItems = (
  currentItems: ReturnType<typeof flatCurrentItems>,
  extractedItems: ReturnType<typeof flatExtractedItems>
) => {
  const pairs: Array<{
    current: ReturnType<typeof flatCurrentItems>[number]
    extracted: ReturnType<typeof flatExtractedItems>[number]
    exact: boolean
  }> = []
  const usedCurrent = new Set<number>()
  const usedExtracted = new Set<number>()
  const addPair = (currentIndex: number, extractedIndex: number, exact: boolean) => {
    pairs.push({
      current: currentItems[currentIndex],
      extracted: extractedItems[extractedIndex],
      exact,
    })
    usedCurrent.add(currentIndex)
    usedExtracted.add(extractedIndex)
  }

  currentItems.forEach((current, currentIndex) => {
    const extractedIndex = extractedItems.findIndex(
      (extracted, index) =>
        !usedExtracted.has(index) &&
        current.key &&
        current.key === extracted.key
    )

    if (extractedIndex < 0) return
    addPair(currentIndex, extractedIndex, true)
  })

  currentItems.forEach((current, currentIndex) => {
    if (usedCurrent.has(currentIndex)) return

    const extractedIndex = extractedItems.findIndex(
      (extracted, index) =>
        !usedExtracted.has(index) && similarEnough(current, extracted)
    )

    if (extractedIndex < 0) return
    addPair(currentIndex, extractedIndex, false)
  })

  return {
    pairs,
    missing: currentItems.filter((_, index) => !usedCurrent.has(index)),
    added: extractedItems.filter((_, index) => !usedExtracted.has(index)),
  }
}

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
                ? normalizeMenuItemPriceOptions(row.price_options)
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
    return {
      menu: menuRow({ status: 'missing' }, menuId),
      sections: [],
    }
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
        .sort(sortByOrder)

      return {
        ...section,
        items,
      }
    })
  )

  return {
    menu: menuRow(menuSnap.data() || {}, menuSnap.id),
    sections: sections.filter(active).sort(sortByOrder),
  }
}

function flatCurrentItems(current: Awaited<ReturnType<typeof readCurrentMenuShape>>) {
  return current.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: normalizeKey(item.name),
      section: section.label,
      name: item.name,
      price: item.price,
      price_options: normalizeMenuItemPriceOptions(item.price_options),
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
      price_options: normalizeMenuItemPriceOptions(item.price_options),
    }))
  )
}

const priceOptionsCount = (
  items: ReturnType<typeof flatCurrentItems> | ReturnType<typeof flatExtractedItems>
) => items.reduce((count, item) => count + item.price_options.length, 0)

const addFlag = (
  flags: MenuProcessFlag[], code: string, level: MenuProcessFlag['level'],
  message: string, item: string, section: string
) => flags.push({ code, level, message, item, section })

export function compareExtractedToCurrent(
  current: Awaited<ReturnType<typeof readCurrentMenuShape>>,
  extractedSections: ExtractedMenuSection[]
) {
  const flags: MenuProcessFlag[] = []
  const currentItems = flatCurrentItems(current)
  const extractedItems = flatExtractedItems(extractedSections)
  const matched = pairItems(currentItems, extractedItems)

  for (const item of matched.missing) {
    addFlag(flags, 'missing-in-extraction', 'warning',
      `${item.name} exists in the current menu but was not found in the draft.`,
      item.name, item.section)
  }

  for (const item of matched.added) {
    addFlag(flags, 'new-in-extraction', 'info',
      `${item.name} was found in the draft but is not in the current menu.`,
      item.name, item.section)
  }

  for (const { current, extracted, exact } of matched.pairs) {
    if (!exact && current.name !== extracted.name) {
      addFlag(flags, 'name-changed', 'info',
        `${current.name} appears as ${extracted.name} in the draft.`,
        extracted.name, extracted.section)
    }

    if (current.price && extracted.price && Math.abs(current.price - extracted.price) >= 0.05) {
      addFlag(flags, 'price-diff', 'warning',
        `${current.name} price differs: current ${current.price}, AI ${extracted.price}.`,
        current.name, current.section)
    }
  }

  for (const item of extractedItems) {
    if (!item.price_options.length) continue

    addFlag(flags, 'variants-found', 'info',
      `${item.name} has ${item.price_options.length} variant option(s) in the draft.`,
      item.name, item.section)

    const current = matched.pairs.find((pair) => pair.extracted === item)?.current
    if (!current || current.price_options.length >= item.price_options.length) continue

    addFlag(flags, 'variants-need-review', 'warning',
      `${item.name} has ${item.price_options.length} draft option(s), but the current menu has ${current.price_options.length}.`,
      item.name, item.section)
  }

  for (const item of matched.missing) {
    if (!item.price_options.length) continue

    addFlag(flags, 'variants-missing-in-extraction', 'warning',
      `${item.name} has current menu variants, but the draft did not include variants.`,
      item.name, item.section)
  }

  return {
    flags,
    counts: {
      extracted_sections: extractedSections.length,
      extracted_items: extractedItems.length,
      current_price_options: priceOptionsCount(currentItems),
      extracted_price_options: priceOptionsCount(extractedItems),
    },
  }
}
