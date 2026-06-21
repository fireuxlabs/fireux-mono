import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { actualMenuAiCost, estimateMenuAiCost, menuAiModelPlan } from '../../../../utils/kitchen-menu-ai-cost'
import { writeKitchenMenuAiUsage } from '../../../../utils/kitchen-menu-ai-usage'
import { MENU_SOURCE_EXTRACTION_PROMPT_VERSION, extractMenuWithAi, type MenuAiExtractionResult } from '../../../../utils/kitchen-menu-ai-extraction'
import {
  compareExtractedToCurrent,
  normalizeExtractedSections,
  readCurrentMenuShape,
  record,
  type MenuProcessFlag,
} from '../../../../utils/kitchen-menu-process'
import { sourceRows } from '../../../../utils/kitchen-menu-source-rows'
import { assertKitchenMenuUploadAccess, kitchenMenuUploadKitchenPath, kitchenMenuUploadPath, requireKitchenMenuUploadUser } from '../../../../utils/kitchen-menu-uploads'

type ProcessMenuBody = Partial<Record<'appId' | 'kitchenId' | 'menuId' | 'uploadId' | 'quality', string>> & {
  limit?: number
  force?: boolean
  confirmBilling?: boolean
}

const text = (value: unknown) => String(value ?? '').trim()
const countExtractedItems = (
  sections: ReturnType<typeof normalizeExtractedSections>
) => sections.reduce((count, section) => count + section.items.length, 0)
const sourceFileSignature = (files: ReturnType<typeof sourceRows>) =>
  files.map((file) => ({
    id: text(file.id),
    name: text(file.file_name),
    type: text(file.file_type),
    kind: text(file.file_kind),
    path: text(file.storage_path),
  }))
const cacheKeyFor = (input: {
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
const cachedSections = (source: Record<string, unknown>, cacheKey: string) => {
  const draft = record(source.ai_draft)
  const cache = record(draft.cache)

  if (text(cache.key) !== cacheKey) return []

  return normalizeExtractedSections({ sections: draft.sections })
}

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before processing a menu source.'
  )
  const body = (await readBody(event)) as ProcessMenuBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const uploadId = requirePathSegment(body?.uploadId || menuId, 'Upload id')

  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)

  const db = getRuntimeFirestore()
  const sourceSnap = await db
    .doc(kitchenMenuUploadPath(appId, kitchenId, uploadId))
    .get()

  if (!sourceSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Upload a source document before processing this menu.',
    })
  }

  const source = record({ ...(sourceSnap.data() || {}), id: sourceSnap.id })
  const kitchenPath = kitchenMenuUploadKitchenPath(appId, kitchenId)
  const sourceIsUrl = Boolean(text(source.source_url) || text(source.file_kind) === 'url')

  if (!body?.confirmBilling) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm kitchen AI billing before processing this menu.',
    })
  }

  const sourceFiles = sourceRows(source)
  const files = sourceFiles.slice(
    0,
    Number.isFinite(Number(body?.limit)) ? Number(body?.limit) : undefined
  )
  const quality = text(body?.quality) === 'strong' ? 'strong' : 'standard'
  const modelPlan = menuAiModelPlan(files, quality)
  const model = modelPlan.extraction_model
  const normalizationModel = modelPlan.normalization_model
  const estimatedCost = estimateMenuAiCost({ files, quality })
  const cacheKey = cacheKeyFor({
    files,
    model,
    normalizationModel,
    quality,
  })
  const cachedDraftSections = body?.force ? [] : cachedSections(source, cacheKey)
  const cacheHit = cachedDraftSections.length > 0
  const current = await readCurrentMenuShape(
    kitchenPath,
    menuId
  )
  const itemCount = current.sections.reduce(
    (count, section) => count + section.items.length,
    0
  )
  const baselineFlags: MenuProcessFlag[] = [
    {
      code: 'source-files-ready',
      level: 'info',
      message: `${files.length} source file(s) ready for extraction.`,
    },
    {
      code: 'published-menu-baseline',
      level: current.menu.status === 'published' ? 'info' : 'warning',
      message: `Current menu status is ${current.menu.status || 'unknown'}.`,
    },
  ]
  if (!current.sections.length) {
    baselineFlags.push({
      code: 'no-current-sections',
      level: 'warning',
      message: 'The current menu has no active sections to compare.',
    })
  }
  if (!itemCount) {
    baselineFlags.push({
      code: 'no-current-items',
      level: 'warning',
      message: 'The current menu has no active dish-backed items to compare.',
    })
  }

  const cachedExtraction: MenuAiExtractionResult = {
    ok: true,
    provider: 'cache',
    model,
    files: files.map((file) => ({
      id: file.id,
      file_name: file.file_name,
      status: 'complete' as const,
      reason: 'cached',
      sections_count: cachedDraftSections.length,
      items_count: countExtractedItems(cachedDraftSections),
    })),
    data: { sections: cachedDraftSections, notes: ['cached extraction'] },
    normalized: {
      status: 'complete' as const,
      provider: 'cache',
      model: normalizationModel,
      sections: cachedDraftSections,
      notes: ['cached normalization'],
      changes: [],
    },
  }
  const extraction = cacheHit
    ? cachedExtraction
    : await extractMenuWithAi(event, {
        appId,
        menuId,
        sourceFiles: files,
        model,
        normalizationModel,
      })
  const extractionData = extraction.ok ? extraction.data : undefined
  const extractedSections = cacheHit
    ? cachedDraftSections
    : extraction.ok
      ? normalizeExtractedSections(extractionData)
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
    ? compareExtractedToCurrent(current, draftSections)
    : {
        flags: [] as MenuProcessFlag[],
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
    current_items: itemCount,
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

  const stamp = serverAuditStamp({ by: uid, appId })
  const billing = await writeKitchenMenuAiUsage({
    sourceRef: sourceSnap.ref,
    kitchenPath,
    appId,
    kitchenId,
    menuId,
    uploadId,
    uid,
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
      menu_id: menuId,
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
      status: text(source.status),
      file_kind: text(source.file_kind) || 'document',
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
})
