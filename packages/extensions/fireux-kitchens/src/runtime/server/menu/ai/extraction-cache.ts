import type { FireuxAiDocumentSourceFile } from 'fireux-ai/runtime/server/utils/document-ai.server.ts'
import {
  countKitchenMenuDraftItems,
  normalizeKitchenMenuDraftSections,
} from '../draft/sections'
import type { MenuAiExtractionResult } from './extraction'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export const menuAiExtractionCacheKey = (input: {
  files: FireuxAiDocumentSourceFile[]
  model: string
  normalizationModel: string
  quality: string
  promptVersion: string
}) => JSON.stringify({
  version: input.promptVersion,
  model: input.model,
  normalizationModel: input.normalizationModel,
  quality: input.quality,
  files: input.files.map((file) => ({
    id: text(file.id),
    name: text(file.file_name),
    type: text(file.file_type),
    kind: text(file.file_kind),
    path: text((file as FireuxAiDocumentSourceFile & { storage_path?: string }).storage_path),
  })),
})

export function cachedMenuExtraction(input: {
  source: Record<string, unknown>
  cacheKey: string
  files: FireuxAiDocumentSourceFile[]
  model: string
  normalizationModel: string
}): MenuAiExtractionResult | null {
  const draft = record(input.source.ai_draft)
  if (text(record(draft.cache).key) !== input.cacheKey) return null
  const sections = normalizeKitchenMenuDraftSections({ sections: draft.sections })
  if (!sections.length) return null
  const itemsCount = countKitchenMenuDraftItems(sections)

  return {
    ok: true,
    provider: 'cache',
    model: input.model,
    files: input.files.map((file) => ({
      id: file.id,
      file_name: file.file_name,
      status: 'complete',
      reason: 'cached',
      sections_count: sections.length,
      items_count: itemsCount,
    })),
    data: { sections, notes: ['cached extraction'] },
    normalized: {
      status: 'complete',
      provider: 'cache',
      model: input.normalizationModel,
      sections,
      notes: ['cached normalization'],
      changes: [],
    },
  }
}

export function checkpointedMenuExtraction(
  source: Record<string, unknown>,
  cacheKey: string
): MenuAiExtractionResult | null {
  const process = record(source.ai_process)
  const checkpoint = record(process.checkpoint)
  if (text(process.key) !== cacheKey || checkpoint.ok !== true) return null
  if (!Array.isArray(checkpoint.files)) return null
  const sections = normalizeKitchenMenuDraftSections(record(checkpoint.data))
  if (!sections.length) return null
  return checkpoint as unknown as MenuAiExtractionResult
}
