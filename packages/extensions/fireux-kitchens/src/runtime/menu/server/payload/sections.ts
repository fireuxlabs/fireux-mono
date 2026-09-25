import {
  normalizeDishDealFlag,
  readDishItemKind,
} from '../../../kitchen/utils/dish.ts'
import type {
  MenuManifestAddOn,
  MenuManifestPriceOption,
  MenuManifestSection,
} from '../../models/menu-detail.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const itemName = (item: Record<string, unknown>) =>
  text(item.name) || text(record(item.item).name)

const itemDescription = (item: Record<string, unknown>) =>
  text(item.description) || text(record(item.item).description)

// Top-level image values here are already joined public rows, not stored
// MenuItem ownership. Raw MenuItem fallbacks are deliberately excluded.
const itemImageUrl = (item: Record<string, unknown>) =>
  text(item.imageUrl) || text(item.image_url) || text(record(item.dish).image)

const itemPriceLabel = (item: Record<string, unknown>) =>
  text(item.priceLabel) || text(item.price_label) || text(item.price)

const priceNumber = (value: unknown) => {
  const parsed = Number(
    text(value)
      .replace(/chf/gi, '')
      .replace(',', '.')
      .match(/\d+(?:\.\d+)?/)?.[0] || 0
  )

  return Number.isFinite(parsed) ? parsed : 0
}

const optionId = (option: Record<string, unknown>, fallback: string) =>
  text(option.id) ||
  text(option.label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') ||
  fallback

const itemPriceOptions = (
  item: Record<string, unknown>
): MenuManifestPriceOption[] =>
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
          (price || optionRecord.price === 0 ? String(price) : ''),
      }
    })
    .filter((option) => option.label && option.priceLabel)

const itemAddOns = (item: Record<string, unknown>): MenuManifestAddOn[] =>
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
    .filter((option) => option.label && option.price >= 0)

export const readMenuManifestSections = (
  sections: unknown[]
): MenuManifestSection[] =>
  sections.map((section, sectionIndex) => {
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
          itemKind:
            readDishItemKind(itemRecord.itemKind) ||
            readDishItemKind(itemRecord.item_kind) ||
            'food',
          isDeal:
            normalizeDishDealFlag(itemRecord.isDeal) ||
            normalizeDishDealFlag(itemRecord.is_deal),
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
