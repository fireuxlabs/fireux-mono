import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server.ts'
import {
  normalizeKitchenMenuDraftSections,
  type KitchenMenuDraftSection,
} from '../utils/kitchen-menu-draft-sections'
import { MENU_NORMALIZATION_JSON_SCHEMA } from './kitchen-menu-ai-schema'

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
    ? value as Record<string, unknown>
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

function buildMenuNormalizationRequest(
  input: {
    menuId: string
    sections: KitchenMenuDraftSection[]
  }
) {
  return {
    input: {
      sections: input.sections,
      instruction:
        'Clean this raw restaurant menu extraction before dish creation. Correct obvious OCR and spelling mistakes, casing, accents, punctuation, and section labels. Split only items that were clearly merged by OCR. Keep all real dishes, prices, price_options, descriptions, and source_file_ids. Preserve labelled variants such as pieces, grams, sizes, and named choices in price_options. Do not invent dishes, prices, or ingredients. Preserve the original mixed-language restaurant wording, but make names dish-ready and professional.',
    },
    context: {
      domain: 'restaurant_menu',
      menuId: input.menuId,
      sourceKind: 'raw_menu_photo_extraction',
      currency: 'CHF',
      languagePolicy:
        'Treat the original menu as default mixed-language copy, not one source language.',
    },
    outputJsonSchema: MENU_NORMALIZATION_JSON_SCHEMA,
    outputSchema: {
      sections: [
        {
          label: 'Clean section label',
          items: [
            {
              name: 'Clean dish name',
              description: 'Clean description or empty string',
              price: 0,
              price_options: [
                {
                  label: 'Variant label',
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
    model: string
    timeoutMs: number
    sections: KitchenMenuDraftSection[]
  }
): Promise<MenuAiNormalizationResult> {
  if (!input.sections.length) {
    return skippedNormalization('Raw extraction did not produce sections to normalize.')
  }

  const ai = useFireuxAi(event)
  const response = await ai.generateJson<NormalizedMenu>({
    appId: input.appId,
    task: 'extract_structured_data',
    model: input.model,
    timeoutMs: input.timeoutMs,
    ...buildMenuNormalizationRequest({
      menuId: input.menuId,
      sections: input.sections,
    }),
  })

  if (!response.ok) {
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

  return {
    status: sections.length ? 'complete' : 'empty',
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    sections,
    notes: notesFrom(response.data),
    changes: Array.isArray(changes) ? changes : [],
  }
}
