import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  normalizeKitchenMenuDraftSections,
  type KitchenMenuDraftSection,
} from '../draft/sections'
import { MENU_NORMALIZATION_JSON_SCHEMA } from './schema'
import { MENU_CHOICE_EXTRACTION_INSTRUCTION } from './choices'

type NormalizedMenu = {
  sections?: unknown[]
  notes?: unknown[]
  changes?: unknown[]
}

export type MenuAiNormalizationResult = {
  status: 'complete' | 'empty' | 'skipped' | 'failed'
  reason?: string
  provider?: string
  model?: string
  usage?: Record<string, unknown>
  sections: KitchenMenuDraftSection[]
  notes: string[]
  changes: unknown[]
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const notesFrom = (value: unknown) => {
  const notes = record(value).notes
  return Array.isArray(notes)
    ? notes.map((note) => String(note ?? '').trim()).filter(Boolean)
    : []
}

const skippedNormalization = (reason: string): MenuAiNormalizationResult => ({
  status: 'skipped',
  reason,
  sections: [],
  notes: [],
  changes: [],
})

function buildMenuNormalizationRequest(input: {
  menuId: string
  currencyCode: string
  sections: KitchenMenuDraftSection[]
}) {
  // TODO(menu-ai): Indian Gourmet surfaced provider filter labels like "All Chicken".
  // Flag these before the next production run; decide later if we auto-strip them.
  return {
    input: {
      sections: input.sections,
      instruction: `Clean this raw restaurant menu extraction before dish creation. Correct obvious OCR and spelling mistakes, casing, accents, punctuation, and section labels. Keep or correct item_kind as "food" or "drink" for every item. Describe meal deals in notes for review rather than creating ordinary Dishes for them. Flag storefront/filter section labels prefixed with "All " (for example "All Chicken", "All Dessert", or "All BBQ/Grill") in notes and changes for operator review before publishing. Split only items that were clearly merged by OCR. Keep all real dishes, prices, price_options, add_ons, descriptions, image_url values, source_file_ids, and their aligned *_translations arrays. Preserve required sizes, pieces, grams, and named mutually exclusive choices in price_options. Every price_options.price must remain an absolute full item price greater than zero, never an increment or surcharge. ${MENU_CHOICE_EXTRACTION_INSTRUCTION} Keep the lowest displayed variant price in price. Preserve optional extras, toppings, sides, and add-ons in add_ons. An add_ons.price is an incremental surcharge and may remain 0 for a labelled optional free add-on. Preserve existing image_url values, but do not invent new images. Do not invent dishes, prices, ingredients, languages, or translations. Keep canonical authored values as Default and retain only translations already aligned by extraction; never join them with slashes.`,
    },
    context: {
      domain: 'restaurant_menu',
      menuId: input.menuId,
      sourceKind: 'raw_menu_photo_extraction',
      currency: input.currencyCode,
      languagePolicy:
        'Keep canonical authored values as Default and preserve extracted aligned language copies without generating new ones.',
    },
    outputJsonSchema: MENU_NORMALIZATION_JSON_SCHEMA,
    outputSchema: {
      sections: [
        {
          label: 'Clean section label',
          label_translations: [],
          items: [
            {
              name: 'Clean dish name',
              name_translations: [],
              description: 'Clean description or empty string',
              description_translations: [],
              item_kind: 'food',
              image_url: 'Existing image URL or empty string',
              price: 30,
              price_options: [
                {
                  label: 'Pommes Frites',
                  label_translations: [],
                  price: 30,
                },
                {
                  label: 'Rice',
                  label_translations: [],
                  price: 30,
                },
              ],
              add_ons: [
                {
                  label: 'No onions',
                  label_translations: [],
                  price: 0,
                },
              ],
              source_file_ids: ['source-file-id'],
            },
          ],
        },
      ],
      notes: ['Normalization notes'],
      changes: [
        {
          from: 'Raw text',
          to: 'Clean text',
          reason: 'Why this was corrected',
        },
      ],
    },
  }
}

export async function normalizeMenuExtractionWithAi(
  event: H3Event,
  input: {
    appId: string
    menuId: string
    currencyCode: string
    model: string
    timeoutMs: number
    sections: KitchenMenuDraftSection[]
  }
): Promise<MenuAiNormalizationResult> {
  if (!input.sections.length) {
    return skippedNormalization(
      'Raw extraction did not produce sections to normalize.'
    )
  }
  const currencyCode = String(input.currencyCode ?? '')
    .trim()
    .toUpperCase()
  if (!currencyCode) throw new Error('Kitchen currency code is required')

  const ai = useFireuxAi(event)
  console.info('[kitchen-menu-ai-normalization] normalizing extraction', {
    menuId: input.menuId,
    model: input.model,
    sections: input.sections.length,
  })
  const response = await ai.generateJson<NormalizedMenu>({
    appId: input.appId,
    task: 'extract_structured_data',
    model: input.model,
    timeoutMs: input.timeoutMs,
    ...buildMenuNormalizationRequest({
      menuId: input.menuId,
      currencyCode,
      sections: input.sections,
    }),
  })

  if (!response.ok) {
    console.warn('[kitchen-menu-ai-normalization] normalization failed', {
      menuId: input.menuId,
      reason: response.reason,
    })
    return {
      status: 'failed',
      reason: response.reason || 'AI normalization failed.',
      provider: response.provider,
      model: response.model,
      usage: response.usage,
      sections: [],
      notes: [],
      changes: [],
    }
  }

  const sections = normalizeKitchenMenuDraftSections(response.data)
  const changes = record(response.data).changes
  const status = sections.length ? 'complete' : 'empty'

  console.info('[kitchen-menu-ai-normalization] normalization complete', {
    menuId: input.menuId,
    status,
    sections: sections.length,
  })

  return {
    status,
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    sections,
    notes: notesFrom(response.data),
    changes: Array.isArray(changes) ? changes : [],
  }
}
