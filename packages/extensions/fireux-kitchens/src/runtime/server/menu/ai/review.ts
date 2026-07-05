import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  actualMenuAiCost,
  estimateMenuAiCost,
  menuAiModelPlan,
} from './cost'
import {
  MENU_SOURCE_EXTRACTION_PROMPT_VERSION,
  extractMenuWithAi,
  type MenuAiExtractionResult,
} from './extraction'
import { writeKitchenMenuAiUsage } from './usage'
import {
  kitchenMenuBaselineFlags,
  compareKitchenMenuDraftToCurrent,
  type KitchenMenuProcessFlag,
} from '../draft/comparison'
import {
  countKitchenMenuDraftItems,
  normalizeKitchenMenuDraftSections,
} from '../draft/sections'
import { readKitchenMenuCurrentShape } from '../draft/current'
import { sourceRows } from '../source/rows'
import {
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
} from '../source/uploads'

export type ProcessKitchenMenuAiReviewInput = {
  event: H3Event
  appId: string
  kitchenId: string
  menuId: string
  uploadId: string
  uid: string
  quality?: string
  limit?: number
  force?: boolean
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const countExtractedItems = (
  sections: ReturnType<typeof normalizeKitchenMenuDraftSections>
) => countKitchenMenuDraftItems(sections)

const sourceFileSignature = (files: ReturnType<typeof sourceRows>) =>
  files.map((file) => ({
    id: readString(file.id),
    name: readString(file.file_name),
    type: readString(file.file_type),
    kind: readString(file.file_kind),
    path: readString(file.storage_path),
  }))

const kitchenMenuAiReviewCacheKey = (input: {
  files: ReturnType<typeof sourceRows>
  model: string
  normalizationModel: string
  quality: string
}) => JSON.stringify({
  version: MENU_SOURCE_EXTRACTION_PROMPT_VERSION,
  model: input.model,
  normalizationModel: input.normalizationModel,
  quality: input.quality,
  files: sourceFileSignature(input.files),
})

const cachedKitchenMenuDraftSections = (
  source: Record<string, unknown>,
  cacheKey: string
) => {
  const draft = record(source.ai_draft)
  const cache = record(draft.cache)

  if (readString(cache.key) !== cacheKey) return []

  return normalizeKitchenMenuDraftSections({ sections: draft.sections })
}

function cachedKitchenMenuExtraction(input: {
  files: ReturnType<typeof sourceRows>
  model: string
  normalizationModel: string
  sections: ReturnType<typeof normalizeKitchenMenuDraftSections>
}): MenuAiExtractionResult {
  return {
    ok: true,
    provider: 'cache',
    model: input.model,
    files: input.files.map((file) => ({
      id: file.id,
      file_name: file.file_name,
      status: 'complete' as const,
      reason: 'cached',
      sections_count: input.sections.length,
      items_count: countKitchenMenuDraftItems(input.sections),
    })),
    data: { sections: input.sections, notes: ['cached extraction'] },
    normalized: {
      status: 'complete' as const,
      provider: 'cache',
      model: input.normalizationModel,
      sections: input.sections,
      notes: ['cached normalization'],
      changes: [],
    },
  }
}

export async function processKitchenMenuAiReview(
  input: ProcessKitchenMenuAiReviewInput
) {
  const db = getRuntimeFirestore()
  const sourceSnap = await db
    .doc(kitchenMenuUploadPath(input.appId, input.kitchenId, input.uploadId))
    .get()

  if (!sourceSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Upload a source document before processing this menu.',
    })
  }

  const source = record({ ...(sourceSnap.data() || {}), id: sourceSnap.id })
  const kitchenPath = kitchenMenuUploadKitchenPath(input.appId, input.kitchenId)
  const sourceIsUrl = Boolean(
    readString(source.source_url) || readString(source.file_kind) === 'url'
  )
  const sourceFiles = sourceRows(source)
  const files = sourceFiles.slice(
    0,
    Number.isFinite(Number(input.limit)) ? Number(input.limit) : undefined
  )
  const quality = readString(input.quality) === 'strong' ? 'strong' : 'standard'
  const modelPlan = menuAiModelPlan(files, quality)
  const model = modelPlan.extraction_model
  const normalizationModel = modelPlan.normalization_model
  const estimatedCost = estimateMenuAiCost({ files, quality })
  const cacheKey = kitchenMenuAiReviewCacheKey({
    files,
    model,
    normalizationModel,
    quality,
  })
  const cachedDraftSections = input.force
    ? []
    : cachedKitchenMenuDraftSections(source, cacheKey)
  const cacheHit = cachedDraftSections.length > 0
  const current = await readKitchenMenuCurrentShape(kitchenPath, input.menuId)
  const currentItemCount = current.sections.reduce(
    (count, section) => count + section.items.length,
    0
  )
  const baselineFlags = kitchenMenuBaselineFlags({
    filesCount: files.length,
    currentStatus: current.menu.status,
    currentSectionsCount: current.sections.length,
    currentItemsCount: currentItemCount,
  })
  const extraction = cacheHit
    ? cachedKitchenMenuExtraction({
        files,
        model,
        normalizationModel,
        sections: cachedDraftSections,
      })
    : await extractMenuWithAi(input.event, {
        appId: input.appId,
        menuId: input.menuId,
        sourceFiles: files,
        model,
        normalizationModel,
      })
  const extractionData = extraction.ok ? extraction.data : undefined
  const extractedSections = cacheHit
    ? cachedDraftSections
    : extraction.ok
      ? normalizeKitchenMenuDraftSections(extractionData)
      : []
  const normalizedSections = extraction.normalized?.status === 'complete'
    ? extraction.normalized.sections
    : []
  const draftSections = normalizedSections.length
    ? normalizedSections
    : extractedSections
  const extractedStatus = extraction.ok
    ? extractedSections.length
      ? 'complete'
      : 'empty'
    : 'failed'
  const extractedComparison = extractedStatus === 'complete'
    ? compareKitchenMenuDraftToCurrent(current, draftSections)
    : {
        flags: [] as KitchenMenuProcessFlag[],
        counts: {
          extracted_sections: draftSections.length,
          extracted_items: 0,
        },
      }
  const fileFlags = extraction.files
    .filter((file) => file.status === 'failed')
    .map((file) => ({
      code: 'ai-file-extraction-failed',
      level: 'warning' as const,
      message: `${file.file_name || file.id} was not processed: ${file.reason || 'AI extraction failed for this file.'}`,
      item: file.file_name || file.id,
    }))
  const flags = [
    ...baselineFlags,
    ...(!extraction.ok
      ? [
          {
            code: 'ai-extraction-failed',
            level: 'error' as const,
            message: extraction.reason || 'AI extraction failed.',
          },
        ]
      : []),
    ...(extraction.ok && !extractedSections.length
      ? [
          {
            code: 'ai-extraction-empty',
            level: 'warning' as const,
            message: sourceIsUrl
              ? 'AI found no menu items in the fetched URL content. This page may load its menu through a widget or popup.'
              : 'AI extraction returned no sections.',
          },
        ]
      : []),
    ...fileFlags,
    ...(extraction.normalized?.status === 'failed'
      ? [
          {
            code: 'ai-normalization-failed',
            level: 'warning' as const,
            message: extraction.normalized.reason ||
              'AI normalization failed; comparing raw extraction.',
          },
        ]
      : []),
    ...extractedComparison.flags,
  ]
  const comparisonCounts = {
    source_files: files.length,
    current_sections: current.sections.length,
    current_items: currentItemCount,
    raw_extracted_sections: extractedSections.length,
    raw_extracted_items: countExtractedItems(extractedSections),
    normalized_sections: normalizedSections.length,
    normalized_items: countExtractedItems(normalizedSections),
    ...extractedComparison.counts,
  }
  const costPlan = {
    ...modelPlan,
    currency: estimatedCost.currency,
    estimated_amount_minor: estimatedCost.amount_minor,
    estimated_amount_label: estimatedCost.amount_label,
    quality,
    model,
    normalization_model: normalizationModel,
    prompt_version: MENU_SOURCE_EXTRACTION_PROMPT_VERSION,
    source_files: files.length,
    planned_ai_calls: cacheHit ? 0 : files.length + 1,
    cache_hit: cacheHit,
  }
  const actualCost = actualMenuAiCost([
    ...extraction.files.map((file) => ({
      model: extraction.model,
      usage: file.usage,
    })),
    {
      model: extraction.normalized?.model,
      usage: extraction.normalized?.usage,
    },
  ])
  const billableAmountMinor = cacheHit
    ? 0
    : estimatedCost.amount_minor
  const draftItemCount = countExtractedItems(draftSections)
  const canWriteDraft = extractedStatus === 'complete' && draftItemCount > 0
  const write = {
    menu_written: false,
    action: canWriteDraft ? 'review-saved' : 'not-written',
    sections_count: draftSections.length,
    items_count: draftItemCount,
  }
  const processMessage = canWriteDraft
    ? 'AI converted the upload and saved a review draft. Confirm it to create dishes and menu records.'
    : 'AI processing finished, but no review draft was saved.'
  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const billing = await writeKitchenMenuAiUsage({
    sourceRef: sourceSnap.ref,
    kitchenPath,
    appId: input.appId,
    kitchenId: input.kitchenId,
    menuId: input.menuId,
    uploadId: input.uploadId,
    uid: input.uid,
    quality,
    provider: extraction.provider,
    model,
    normalizationModel,
    promptVersion: MENU_SOURCE_EXTRACTION_PROMPT_VERSION,
    filesCount: files.length,
    plannedAiCalls: costPlan.planned_ai_calls,
    estimate: estimatedCost,
    actual: actualCost,
    amountMinor: billableAmountMinor,
    cacheHit,
    write,
    stamp,
    sourceUpdate: {
      status: canWriteDraft ? 'draft' : 'uploaded',
      menu_id: input.menuId,
      ai_draft: {
        status: extractedStatus,
        source: normalizedSections.length ? 'normalized' : 'extracted',
        sections: draftSections,
        report: {
          flags,
          counts: comparisonCounts,
        },
        write,
        cache: {
          key: cacheKey,
          ...costPlan,
        },
        updated: stamp,
      },
      updated: stamp,
    },
  })

  return {
    ok: true,
    mode: 'ai-process',
    message: processMessage,
    source: {
      id: sourceSnap.id,
      status: readString(source.status),
      file_kind: readString(source.file_kind) || 'document',
      files_total_count: sourceFiles.length,
      files_count: files.length,
      files,
    },
    current,
    extracted: {
      status: extractedStatus,
      provider: extraction.provider,
      model: extraction.model,
      reason: extraction.ok ? undefined : extraction.reason,
      files: extraction.files,
      sections: extractedSections,
      notes: Array.isArray(extractionData?.notes) ? extractionData.notes : [],
    },
    normalized: {
      status: extraction.normalized?.status || 'skipped',
      provider: extraction.normalized?.provider,
      model: extraction.normalized?.model,
      reason: extraction.normalized?.reason,
      sections: normalizedSections,
      notes: extraction.normalized?.notes || [],
      changes: extraction.normalized?.changes || [],
    },
    comparison: {
      can_compare: extractedStatus === 'complete',
      source: normalizedSections.length ? 'normalized' : 'extracted',
      flags,
      counts: comparisonCounts,
    },
    cost: costPlan,
    billing,
    write,
  }
}
