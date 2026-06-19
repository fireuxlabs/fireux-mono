import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'

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

const payloadSections = (payload: Record<string, unknown>) => {
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
          price: priceNumber(itemRecord.price),
          ...(priceLabel ? { priceLabel } : {}),
          priceOptions: [],
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
    const pageStyle = readRecord(payload.page_style)
    const sections = payloadSections(payload)

    return {
      ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
      ...(sections.length ? { sections } : {}),
    }
  } catch {
    return {}
  }
}
