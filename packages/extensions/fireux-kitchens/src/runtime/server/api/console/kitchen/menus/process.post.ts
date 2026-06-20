import {
  createError,
  defineEventHandler,
  readBody,
  type H3Event,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { extractMenuWithAi } from '../../../../utils/kitchen-menu-ai-extraction'
import {
  compareExtractedToCurrent,
  fileRows,
  normalizeExtractedSections,
  readCurrentMenuShape,
  record,
  type MenuProcessFlag,
} from '../../../../utils/kitchen-menu-process'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../utils/kitchen-menu-uploads'

type ProcessMenuBody = {
  appId?: string
  kitchenId?: string
  menuId?: string
  uploadId?: string
  limit?: number
}

const text = (value: unknown) => String(value ?? '').trim()

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
  const sourceFiles = fileRows(source)
  const files = sourceFiles.slice(
    0,
    Number.isFinite(Number(body?.limit)) ? Number(body?.limit) : undefined
  )
  const current = await readCurrentMenuShape(
    kitchenMenuUploadKitchenPath(appId, kitchenId),
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

  const extraction = await extractMenuWithAi(event, {
    appId,
    menuId,
    sourceFiles: files,
  })
  const extractionData = extraction.ok ? extraction.data : undefined
  const extractedSections = extraction.ok
    ? normalizeExtractedSections(extractionData)
    : []
  const extractedStatus = extraction.ok
    ? extractedSections.length
      ? 'complete'
      : 'empty'
    : 'failed'
  const extractedComparison = extractedStatus === 'complete'
    ? compareExtractedToCurrent(current, extractedSections)
    : {
        flags: [] as MenuProcessFlag[],
        counts: {
          extracted_sections: extractedSections.length,
          extracted_items: 0,
        },
      }
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
            message: 'AI extraction returned no sections.',
          },
        ]
      : []),
    ...extractedComparison.flags,
  ]

  return {
    ok: true,
    mode: 'ai-dry-run',
    message:
      'AI extraction and comparison completed as a dry run. No menu, dish, section, or item records were written.',
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
    comparison: {
      can_compare: extractedStatus === 'complete',
      flags,
      counts: {
        source_files: files.length,
        current_sections: current.sections.length,
        current_items: itemCount,
        ...extractedComparison.counts,
      },
    },
  }
})
