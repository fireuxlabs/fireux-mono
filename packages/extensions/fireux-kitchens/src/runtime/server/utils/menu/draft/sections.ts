import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../../../models/kitchen/menu/menu-item.model'

export type KitchenMenuDraftItem = {
  name: string
  description: string
  image_url: string
  price: number
  add_ons: unknown[]
  price_options: unknown[]
  source_file_ids: string[]
}

export type KitchenMenuDraftSection = {
  label: string
  items: KitchenMenuDraftItem[]
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const money = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const normalized = readString(value)
    .replace(/chf/ig, '')
    .replace(/[,]/g, '.')
    .match(/\d+(?:\.\d+)?/)

  return normalized ? numberValue(normalized[0]) : 0
}

export function normalizeKitchenMenuDraftSections(
  value: unknown
): KitchenMenuDraftSection[] {
  const source = asRecord(value)
  const sections = Array.isArray(source.sections) ? source.sections : []

  return sections
    .map((section) => {
      const data = asRecord(section)
      const items = Array.isArray(data.items) ? data.items : []

      return {
        label: readString(data.label),
        items: items
          .map((item) => {
            const row = asRecord(item)
            return {
              name: readString(row.name),
              description: readString(row.description),
              image_url: readString(row.image_url),
              price: money(row.price),
              add_ons: Array.isArray(row.add_ons)
                ? normalizeMenuItemAddOns(row.add_ons)
                : [],
              price_options: Array.isArray(row.price_options)
                ? normalizeMenuItemPriceOptions(row.price_options)
                : [],
              source_file_ids: Array.isArray(row.source_file_ids)
                ? row.source_file_ids.map(readString).filter(Boolean)
                : [],
            }
          })
          .filter((item) => item.name),
      }
    })
    .filter((section) => section.label || section.items.length)
}

export const countKitchenMenuDraftItems = (
  sections: KitchenMenuDraftSection[]
) => sections.reduce((count, section) => count + section.items.length, 0)
