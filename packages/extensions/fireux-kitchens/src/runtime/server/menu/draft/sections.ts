import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../../models/kitchen/menu/menu-item.model'
import {
  normalizeDishDealFlag,
  normalizeDishItemKind,
} from '../../../models/kitchen/dish.model'
import { defaultMenuLanguageText } from '../language/default-text'
import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli.ts'

export type KitchenMenuDraftTranslation = {
  language: Exclude<SproochliLanguageCode, ''>
  text: string
}

export type KitchenMenuDraftItem = {
  name: string
  name_translations: KitchenMenuDraftTranslation[]
  description: string
  description_translations: KitchenMenuDraftTranslation[]
  item_kind: ReturnType<typeof normalizeDishItemKind>
  is_deal: boolean
  /** Untrusted source candidate for the Dish image review/ingestion flow. */
  image_url: string
  price: number
  add_ons: unknown[]
  price_options: unknown[]
  source_file_ids: string[]
}

export type KitchenMenuDraftSection = {
  label: string
  label_translations: KitchenMenuDraftTranslation[]
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

const cleanTranslations = (value: unknown): KitchenMenuDraftTranslation[] => {
  if (!Array.isArray(value)) return []

  const byLanguage = new Map<Exclude<SproochliLanguageCode, ''>, string>()
  value.forEach((entry) => {
    const data = asRecord(entry)
    const language = normalizeSproochliLanguage(data.language)
    const translatedText = readString(data.text)
    if (!language || !translatedText) return
    byLanguage.set(language, translatedText)
  })

  return [...byLanguage].map(([language, translatedText]) => ({
    language,
    text: translatedText,
  }))
}

const cleanAddOns = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((entry) => {
      const source = asRecord(entry)
      const option = normalizeMenuItemAddOns([source])[0]
      return option
        ? {
            ...option,
            label: defaultMenuLanguageText(option.label),
            label_translations: cleanTranslations(source.label_translations),
          }
        : null
    })
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .filter((option) => option.label)

const cleanPriceOptions = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((entry) => {
      const source = asRecord(entry)
      const option = normalizeMenuItemPriceOptions([source])[0]
      return option
        ? {
            ...option,
            label: defaultMenuLanguageText(option.label),
            label_translations: cleanTranslations(source.label_translations),
          }
        : null
    })
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .filter((option) => option.label)

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
        label: defaultMenuLanguageText(data.label),
        label_translations: cleanTranslations(data.label_translations),
        items: items
          .map((item) => {
            const row = asRecord(item)
            return {
              name: defaultMenuLanguageText(row.name),
              name_translations: cleanTranslations(row.name_translations),
              description: defaultMenuLanguageText(row.description),
              description_translations: cleanTranslations(
                row.description_translations
              ),
              item_kind: normalizeDishItemKind(row.item_kind),
              is_deal: normalizeDishDealFlag(row.is_deal),
              image_url: readString(row.image_url),
              price: money(row.price),
              add_ons: Array.isArray(row.add_ons) ? cleanAddOns(row.add_ons) : [],
              price_options: Array.isArray(row.price_options)
                ? cleanPriceOptions(row.price_options)
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
