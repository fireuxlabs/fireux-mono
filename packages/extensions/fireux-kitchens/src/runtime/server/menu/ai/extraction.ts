import type { H3Event } from 'h3'
import {
  runFireuxAiDocumentExtraction,
  type FireuxAiDocumentFileResult,
  type FireuxAiDocumentSourceFile,
} from 'fireux-ai/runtime/server/utils/document-ai.server.ts'
import { MENU_EXTRACTION_JSON_SCHEMA } from './schema'
import {
  normalizeMenuExtractionWithAi,
  type MenuAiNormalizationResult,
} from './normalization'
import {
  normalizeKitchenMenuDraftSections,
  type KitchenMenuDraftSection,
} from '../draft/sections'
import { resolveKitchenMenuUrlContent } from '../source/url-content'

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
  normalized?: MenuAiNormalizationResult
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const MENU_SOURCE_EXTRACTION_PROMPT_VERSION = 'menu-source-v3'
export const MENU_SOURCE_EXTRACTION_MODEL =
  text(process.env.FIREUX_AI_MENU_EXTRACTION_MODEL) || 'gpt-5.4-mini'
export const MENU_SOURCE_EXTRACTION_STRONG_MODEL =
  text(process.env.FIREUX_AI_MENU_EXTRACTION_STRONG_MODEL) || 'gpt-5.5'
export const MENU_SOURCE_NORMALIZATION_MODEL =
  text(process.env.FIREUX_AI_MENU_NORMALIZATION_MODEL) ||
    'gpt-5.4-nano'
const MENU_SOURCE_IMAGE_DETAIL = (
  text(process.env.FIREUX_AI_MENU_IMAGE_DETAIL) || 'auto'
) as 'low' | 'high' | 'auto'
const MENU_SOURCE_EXTRACTION_TIMEOUT_MS =
  numberValue(process.env.FIREUX_AI_MENU_EXTRACTION_TIMEOUT_MS) || 120_000
const MENU_SOURCE_URL_TEXT_LIMIT =
  numberValue(process.env.FIREUX_AI_MENU_URL_TEXT_LIMIT) || 80_000

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

const countItems = (sections: KitchenMenuDraftSection[]) =>
  sections.reduce((count, section) => count + section.items.length, 0)

function annotateSections(
  sections: KitchenMenuDraftSection[],
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

function mergeSections(sections: KitchenMenuDraftSection[]) {
  const byLabel = new Map<string, KitchenMenuDraftSection>()

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

const fileExtension = (value: unknown) => {
  const name = text(value).toLowerCase()
  const index = name.lastIndexOf('.')
  return index >= 0 ? name.slice(index + 1) : ''
}

const isPdfFile = (file: FireuxAiDocumentSourceFile) =>
  text(file.file_kind).toLowerCase() === 'pdf' ||
  text(file.file_type).toLowerCase() === 'application/pdf' ||
  fileExtension(file.file_name) === 'pdf'

const isUrlFile = (file: FireuxAiDocumentSourceFile) =>
  text(file.file_kind).toLowerCase() === 'url'

async function withUrlText(file: FireuxAiDocumentSourceFile) {
  if (!isUrlFile(file)) return file

  const resolved = await resolveKitchenMenuUrlContent(file.file_url)

  return {
    ...file,
    text_excerpt: resolved.text.slice(0, MENU_SOURCE_URL_TEXT_LIMIT),
  }
}

function buildMenuSourceExtractionRequest(
  input: {
    menuId: string
    currencyCode: string
    file: FireuxAiDocumentSourceFile
  }
) {
  if (isUrlFile(input.file)) {
    return {
      input: {
        source_url: input.file.file_url,
        page_text: input.file.text_excerpt,
        instruction:
          `Classify this fetched restaurant menu or ordering URL, then extract only menu dishes that are present in the supplied page_text. page_text may be cleaned HTML text or resolved provider menu JSON. Use source_file_ids ["${input.file.id}"] for every item. If page_text is only a shell, booking widget, empty page, or does not contain visible menu items, return {"sections":[],"notes":["no visible menu items in fetched URL content"]}. Keep original section labels and dish names, but correct obvious OCR or spelling mistakes when the intended dish is clear. If a dish, section, variant, or add-on includes the same text in multiple languages, keep only the default menu language text and do not combine translated copies with slashes. Return prices as ${input.currencyCode} numbers. If the provider data includes an item image_url, preserve it; otherwise return image_url as an empty string and do not invent stock images. If a dish has required sizes or mutually exclusive variants, put them in price_options and keep the lowest displayed price in price. If a dish has optional extras, toppings, sides, or provider modifier_groups, put them in add_ons, not standalone dishes. Do not invent dishes, sections, prices, images, or provider data not present in page_text.`,
      },
      context: {
        domain: 'restaurant_menu',
        menuId: input.menuId,
        sourceFileId: input.file.id,
        sourceFileName: input.file.file_name,
        sourceKind: 'menu_source_url',
        currency: input.currencyCode,
        languagePolicy:
          'Keep the default menu language only. Drop translated duplicate text such as Arabic, Chinese, or other secondary-language copies from names and labels.',
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
                image_url: 'Provider image URL or empty string',
                price: 0,
                price_options: [
                  {
                    label: 'Variant label',
                    price: 0,
                  },
                ],
                add_ons: [
                  {
                    label: 'Optional add-on label',
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

  const fileIsPdf = isPdfFile(input.file)
  const sourceLabel = fileIsPdf ? 'PDF' : 'photo or image'

  return {
      input: {
      ...(fileIsPdf
        ? {
            files: [
              {
                id: input.file.id,
                file_name: input.file.file_name,
                file_url: input.file.file_url,
                mime_type: input.file.file_type,
              },
            ],
          }
        : {
            images: [
              {
                id: input.file.id,
                file_name: input.file.file_name,
                url: input.file.file_url,
                detail: MENU_SOURCE_IMAGE_DETAIL,
              },
            ],
            imageDetail: MENU_SOURCE_IMAGE_DETAIL,
          }),
        instruction:
          `Classify this uploaded restaurant menu ${sourceLabel}, then extract only the visible menu dishes from this file. Use source_file_ids ["${input.file.id}"] for every item. Covers, QR codes, contact pages, empty pages, and non-dish pages are valid uploads; return {"sections":[],"notes":["no visible menu items"]} for those. Keep original section labels and dish names, but correct obvious OCR or spelling mistakes when the intended dish is clear. If a dish, section, variant, or add-on includes the same text in multiple languages, keep only the default menu language text and do not combine translated copies with slashes. Return prices as ${input.currencyCode} numbers. Return image_url as an empty string; do not invent stock images from uploaded documents. If a dish has required sizes or mutually exclusive variants, put them in price_options and keep the lowest displayed price in price. Preserve variants such as 3Stk/4Stk/5Stk, 300gr/400gr, or named kids pasta choices as labelled price_options. If a dish has optional extras, toppings, or sides such as "Add-ons: Manchego 2.50" or "Mit Pommes 25.-", put those extras in add_ons. Do not invent dishes, sections, prices, or images.`,
    },
    context: {
      domain: 'restaurant_menu',
      menuId: input.menuId,
      sourceFileId: input.file.id,
      sourceFileName: input.file.file_name,
      sourceKind: fileIsPdf ? 'menu_source_pdf' : 'menu_source_image',
      currency: input.currencyCode,
      languagePolicy:
        'Keep the default menu language only. Drop translated duplicate text such as Arabic, Chinese, or other secondary-language copies from names and labels.',
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
              image_url: '',
              price: 0,
              price_options: [
                {
                  label: 'Variant label',
                  price: 0,
                },
              ],
              add_ons: [
                {
                  label: 'Optional add-on label',
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
    currencyCode: string
    sourceFiles: FireuxAiDocumentSourceFile[]
    model?: string
    normalizationModel?: string
  }
): Promise<MenuAiExtractionResult> {
  const model = text(input.model) || MENU_SOURCE_EXTRACTION_MODEL
  const currencyCode = text(input.currencyCode).toUpperCase()
  if (!currencyCode) throw new Error('Kitchen currency code is required')
  const normalizationModel =
    text(input.normalizationModel) || MENU_SOURCE_NORMALIZATION_MODEL
  const sourceFiles = await Promise.all(input.sourceFiles.map(withUrlText))
  const extraction = await runFireuxAiDocumentExtraction<
    KitchenMenuDraftSection[],
    ExtractedMenu
  >({
    event,
    appId: input.appId,
    model,
    fileTimeoutMs: MENU_SOURCE_EXTRACTION_TIMEOUT_MS,
    files: sourceFiles,
    taskId: input.menuId,
    logScope: 'kitchen-menu-ai-extraction',
    buildRequest: (file) => buildMenuSourceExtractionRequest({
      menuId: input.menuId,
      currencyCode,
      file,
    }),
    readResult: (data, file) => {
      const sections = annotateSections(
        normalizeKitchenMenuDraftSections(data),
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

  if (!extraction.ok) return extraction

  const sections = normalizeKitchenMenuDraftSections(extraction.data)
  const normalized = await normalizeMenuExtractionWithAi(event, {
    appId: input.appId,
    menuId: input.menuId,
    currencyCode,
    model: normalizationModel,
    timeoutMs: MENU_SOURCE_EXTRACTION_TIMEOUT_MS,
    sections,
  })

  return {
    ...extraction,
    normalized,
  }
}
