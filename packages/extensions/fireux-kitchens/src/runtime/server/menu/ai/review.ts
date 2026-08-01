import { createError } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  actualMenuAiCost,
  estimateMenuAiCost,
  menuAiModelPlan,
} from './cost'
import {
  MENU_SOURCE_EXTRACTION_TIMEOUT_MS,
  MENU_SOURCE_EXTRACTION_PROMPT_VERSION,
  cachedMenuExtraction,
  checkpointedMenuExtraction,
  extractMenuSourceWithAi,
  menuAiExtractionCacheKey,
} from './extraction'
import { normalizeMenuExtractionWithAi } from './normalization'
import { writeKitchenMenuAiUsage } from './usage'
import {
  kitchenMenuBaselineFlags,
  compareKitchenMenuDraftToCurrent,
  type KitchenMenuProcessFlag,
} from '../draft/comparison'
import { normalizeKitchenMenuDraftSections } from '../draft/sections'
import { readKitchenMenuCurrentShape } from '../draft/current'
import { sourceRows } from '../source/rows'
import {
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
} from '../source/uploads'
import type { ProcessKitchenMenuAiReviewInput } from './review-types'
import {
  countExtractedMenuItems,
  menuAiCheckpointValue,
  menuAiReviewErrorMessage,
  menuAiReviewRecord,
} from './review-utils'

export type { ProcessKitchenMenuAiReviewInput } from './review-types'

const record = menuAiReviewRecord
const countExtractedItems = countExtractedMenuItems
const errorMessage = menuAiReviewErrorMessage
const checkpointValue = menuAiCheckpointValue
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
  const cacheKey = menuAiExtractionCacheKey({
    files,
    model,
    normalizationModel,
    quality,
  })
  const cachedExtraction = input.force
    ? null
    : cachedMenuExtraction({
        source,
        cacheKey,
        files,
        model,
        normalizationModel,
      })
  const checkpointedExtraction = cachedExtraction
    ? null
    : checkpointedMenuExtraction(source, cacheKey)
  const cacheHit = Boolean(cachedExtraction)
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
  let extraction = cachedExtraction || checkpointedExtraction
  try {
    if (!extraction) {
      const extractingStamp = serverAuditStamp({
        by: input.uid,
        appId: input.appId,
      })
      await sourceSnap.ref.set({
        status: 'extracting',
        menu_id: input.menuId,
        ai_process: {
          stage: 'extracting',
          key: cacheKey,
          quality,
          model,
          normalization_model: normalizationModel,
          checkpoint: FieldValue.delete(),
          updated: extractingStamp,
        },
        updated: extractingStamp,
      }, { merge: true })
      extraction = await extractMenuSourceWithAi(input.event, {
        appId: input.appId,
        menuId: input.menuId,
        currencyCode: input.currencyCode,
        sourceFiles: files,
        model,
      })
      if (extraction.ok) {
        const checkpointStamp = serverAuditStamp({
          by: input.uid,
          appId: input.appId,
        })
        await sourceSnap.ref.set({
          status: 'extracting',
          ai_process: {
            stage: 'normalizing',
            key: cacheKey,
            checkpoint: checkpointValue(extraction),
            updated: checkpointStamp,
          },
          updated: checkpointStamp,
        }, { merge: true })
      }
    }
    if (extraction.ok && !extraction.normalized) {
      const sections = normalizeKitchenMenuDraftSections(extraction.data)
      extraction = {
        ...extraction,
        normalized: await normalizeMenuExtractionWithAi(input.event, {
          appId: input.appId,
          menuId: input.menuId,
          currencyCode: input.currencyCode,
          model: normalizationModel,
          timeoutMs: MENU_SOURCE_EXTRACTION_TIMEOUT_MS,
          sections,
        }),
      }
    }
  } catch (cause) {
    const failedStamp = serverAuditStamp({ by: input.uid, appId: input.appId })
    await sourceSnap.ref.set({
      status: normalizeKitchenMenuDraftSections(record(source.ai_draft)).length ? 'draft' : 'uploaded',
      ai_process: {
        stage: 'failed',
        key: cacheKey,
        reason: errorMessage(cause),
        updated: failedStamp,
      },
      updated: failedStamp,
    }, { merge: true }).catch(() => undefined)
    throw cause
  }
  const extractionData = extraction.ok ? extraction.data : undefined
  const extractedSections = extraction.ok
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
      ai_process: {
        stage: extraction.ok ? 'complete' : 'failed',
        key: cacheKey,
        ...(extraction.ok ? {} : {
          reason: extraction.reason || 'AI extraction failed.',
        }),
        checkpoint: FieldValue.delete(),
        updated: stamp,
      },
      ai_draft: {
        status: extractedStatus,
        source: normalizedSections.length ? 'normalized' : 'extracted',
        sections: draftSections,
        provenance: {
          provider:
            extraction.normalized?.provider ||
            extraction.provider ||
            'fireux-ai-menu-extraction',
          model:
            extraction.normalized?.model ||
            extraction.model ||
            model,
        },
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
      status: canWriteDraft ? 'draft' : 'uploaded',
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
