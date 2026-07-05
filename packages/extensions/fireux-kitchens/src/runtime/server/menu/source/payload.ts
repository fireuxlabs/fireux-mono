import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { readMenuPageStyle } from '../payload/page-style.ts'

const text = (value: unknown) => String(value ?? '').trim()

const fallbackId = (
  value: unknown,
  fallback: string
) => normalizeSlug(text(value)) || fallback

const priceNumber = (value: unknown) => {
  const match = text(value).replace(',', '.').match(/\d+(\.\d+)?/)
  const parsed = Number(match?.[0] || 0)

  return Number.isFinite(parsed) ? parsed : 0
}
const priceOptions = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((option, optionIndex) => {
      const optionRecord = readRecord(option)
      const label = text(optionRecord.label)
      const price = priceNumber(optionRecord.price)

      return {
        id:
          text(optionRecord.id) ||
          label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          `option-${optionIndex + 1}`,
        label,
        price,
      }
    })
    .filter((option) => option.label && option.price > 0)
const addOns = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((option, optionIndex) => {
      const optionRecord = readRecord(option)
      const label = text(optionRecord.label)
      const price = priceNumber(optionRecord.price)

      return {
        id:
          text(optionRecord.id) ||
          label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          `add-on-${optionIndex + 1}`,
        label,
        price,
      }
    })
    .filter((option) => option.label && option.price > 0)

const payloadSections = (payload: Record<string, unknown>) => {
  const manifest = readRecord(payload.manifest)
  const content = readRecord(manifest.content)
  const manifestSections = Array.isArray(content.sections) ? content.sections : []
  if (manifestSections.length) return manifestSections

  const sections = Array.isArray(payload.sections) ? payload.sections : []

  return sections.map((section, sectionIndex) => {
    const sectionRecord = readRecord(section)
    const label = text(sectionRecord.label || sectionRecord.name)
    const sectionId = fallbackId(
      sectionRecord.id || label,
      `section-${sectionIndex + 1}`
    )
    const items = Array.isArray(sectionRecord.items) ? sectionRecord.items : []

    return {
      id: sectionId,
      section: {
        id: sectionId,
        label,
        description: readRecordString(sectionRecord, 'description'),
      },
      label,
      description: readRecordString(sectionRecord, 'description'),
      items: items.map((item, itemIndex) => {
        const itemRecord = readRecord(item)
        const name = readRecordString(itemRecord, 'name')
        const itemId = fallbackId(
          itemRecord.id || name,
          `${sectionId}-item-${itemIndex + 1}`
        )
        const priceLabel = text(itemRecord.price_label || itemRecord.price)
        const itemPriceOptions = priceOptions(
          itemRecord.priceOptions || itemRecord.price_options
        )
        const itemAddOns = addOns(itemRecord.addOns || itemRecord.add_ons)

        return {
          id: itemId,
          item: {
            id: itemId,
            name,
            description: readRecordString(itemRecord, 'description'),
          },
          dish: null,
          name,
          description: readRecordString(itemRecord, 'description'),
          image_url:
            readRecordString(itemRecord, 'image_url') ||
            readRecordString(itemRecord, 'imageUrl'),
          price: priceNumber(itemRecord.price),
          ...(priceLabel ? { priceLabel } : {}),
          priceOptions: itemPriceOptions,
          addOns: itemAddOns,
        }
      }),
    }
  })
}

export async function menuSourcePayloadFromApi(apiTo: string) {
  if (!apiTo) return {}

  try {
    const response = await fetch(apiTo, {
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) return {}

    const payload = readRecord(await response.json())
    const manifest = readRecord(payload.manifest)
    const presentation = readRecord(manifest.presentation)
    const pageStyle = readMenuPageStyle(payload.page_style || presentation.pageStyle)
    const sections = payloadSections(payload)

    return {
      ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
      ...(sections.length ? { sections } : {}),
    }
  } catch {
    return {}
  }
}
