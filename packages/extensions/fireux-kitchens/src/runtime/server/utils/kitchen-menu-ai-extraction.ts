import type { H3Event } from 'h3'
import {
  runFireuxAiDocumentExtraction,
  type FireuxAiDocumentFileResult,
  type FireuxAiDocumentSourceFile,
} from 'fireux-ai/runtime/server/utils/document-ai.server.ts'
import {
  fileRows,
  normalizeExtractedSections,
  record,
  type ExtractedMenuSection,
} from './kitchen-menu-process'

type ExtractedMenu = {
  sections?: unknown[]
  notes?: unknown[]
}

export type MenuAiExtractionResult = {
  ok: boolean
  data?: ExtractedMenu
  reason?: string
  provider?: string
  model?: string
  files: FireuxAiDocumentFileResult[]
}

const text = (value: unknown) => String(value ?? '').trim()

const MENU_PHOTO_EXTRACTION_MODEL =
  text(process.env.FIREUX_AI_MENU_EXTRACTION_MODEL) || 'gpt-5.5'

const MENU_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                price_options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      price: { type: 'number' },
                    },
                    required: ['label', 'price'],
                  },
                },
                source_file_ids: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [
                'name',
                'description',
                'price',
                'price_options',
                'source_file_ids',
              ],
            },
          },
        },
        required: ['label', 'items'],
      },
    },
    notes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['sections', 'notes'],
} as const

const normalizeKey = (value: unknown) =>
  text(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const notesFrom = (value: unknown) => {
  const notes = record(value).notes
  return Array.isArray(notes) ? notes.map(text).filter(Boolean) : []
}

const countItems = (sections: ExtractedMenuSection[]) =>
  sections.reduce((count, section) => count + section.items.length, 0)

function annotateSections(
  sections: ExtractedMenuSection[],
  fileId: string
) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      source_file_ids: [fileId],
    })),
  }))
}

function mergeSections(sections: ExtractedMenuSection[]) {
  const byLabel = new Map<string, ExtractedMenuSection>()

  for (const section of sections) {
    const key = normalizeKey(section.label) || `section-${byLabel.size + 1}`
    const existing = byLabel.get(key)

    if (existing) {
      existing.items.push(...section.items)
      continue
    }

    byLabel.set(key, {
      label: section.label,
      items: [...section.items],
    })
  }

  return Array.from(byLabel.values())
}

function buildMenuPhotoExtractionRequest(
  input: {
    menuId: string
    file: FireuxAiDocumentSourceFile
  }
) {
  return {
    input: {
      images: [
        {
          id: input.file.id,
          file_name: input.file.file_name,
          url: input.file.file_url,
          detail: 'high',
        },
      ],
      imageDetail: 'high',
      instruction:
        `Classify this uploaded restaurant menu photo, then extract only the visible menu dishes from this one image. Use source_file_ids ["${input.file.id}"] for every item. Covers, QR codes, contact pages, empty pages, and non-dish pages are valid uploads; return {"sections":[],"notes":["no visible menu items"]} for those. Keep original section labels and dish names. Preserve mixed-language wording. Return prices as CHF numbers. If a dish has multiple sizes or variants, put them in price_options and keep the lowest displayed price in price. Do not invent dishes, sections, or prices.`,
    },
    context: {
      domain: 'restaurant_menu',
      menuId: input.menuId,
      sourceFileId: input.file.id,
      sourceFileName: input.file.file_name,
      sourceKind: 'menu_source_phone_photo',
      currency: 'CHF',
      languagePolicy:
        'Treat the original menu as default mixed-language copy, not one source language.',
    },
    outputJsonSchema: MENU_EXTRACTION_JSON_SCHEMA,
    outputSchema: {
      sections: [
        {
          label: 'Section label',
          items: [
            {
              name: 'Dish name',
              description: 'Short description or empty string',
              price: 0,
              price_options: [
                {
                  label: 'Variant label',
                  price: 0,
                },
              ],
              source_file_ids: [input.file.id],
            },
          ],
        },
      ],
      notes: ['Extraction notes'],
    },
  }
}

export async function extractMenuWithAi(
  event: H3Event,
  input: {
    appId: string
    menuId: string
    sourceFiles: ReturnType<typeof fileRows>
  }
): Promise<MenuAiExtractionResult> {
  return await runFireuxAiDocumentExtraction<
    ExtractedMenuSection[],
    ExtractedMenu
  >({
    event,
    appId: input.appId,
    model: MENU_PHOTO_EXTRACTION_MODEL,
    files: input.sourceFiles,
    taskId: input.menuId,
    logScope: 'kitchen-menu-process',
    buildRequest: (file) => buildMenuPhotoExtractionRequest({
      menuId: input.menuId,
      file,
    }),
    readResult: (data, file) => {
      const sections = annotateSections(
        normalizeExtractedSections(data),
        file.id
      )
      const fileNotes = notesFrom(data)

      return {
        status: sections.length ? 'complete' : 'empty',
        reason: sections.length
          ? undefined
          : fileNotes[0] || 'No visible menu items detected.',
        part: sections,
        notes: fileNotes,
        sections_count: sections.length,
        items_count: countItems(sections),
      }
    },
    mergeParts: (parts, notes) => ({
      sections: mergeSections(parts.flat()),
      notes: notes.length ? notes : ['no visible menu items'],
    }),
  })
}
