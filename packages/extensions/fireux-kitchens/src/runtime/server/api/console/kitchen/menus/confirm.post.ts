import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { writeKitchenMenuDraft } from '../../../../menu/draft/write'
import { compareKitchenMenuDraftToCurrent } from '../../../../menu/draft/comparison'
import { readKitchenMenuCurrentShape } from '../../../../menu/draft/current'
import {
  countKitchenMenuDraftItems,
  normalizeKitchenMenuDraftSections,
} from '../../../../menu/draft/sections'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuCurrencyCode,
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../menu/source/uploads'

type ConfirmMenuBody = Partial<Record<'appId' | 'kitchenId' | 'menuId' | 'uploadId', string>> & {
  confirmDishes?: boolean
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const destructiveOptionFlagCodes = new Set([
  'variants-missing-in-extraction',
  'add-ons-missing-in-extraction',
])
const hasDuplicates = (values: unknown[]) => {
  const keys = values.map((value) => normalizeSlug(value)).filter(Boolean)
  return keys.length !== values.length || new Set(keys).size !== keys.length
}

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before confirming a menu draft.'
  )
  const body = (await readBody(event)) as ConfirmMenuBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const uploadId = requirePathSegment(body?.uploadId || menuId, 'Upload id')

  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)
  await assertKitchenMenuCurrencyCode(appId, kitchenId)

  if (!body?.confirmDishes) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm before creating dishes from this menu draft.',
    })
  }

  const db = getRuntimeFirestore()
  const sourceRef = db.doc(kitchenMenuUploadPath(appId, kitchenId, uploadId))
  const sourceSnap = await sourceRef.get()

  if (!sourceSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Process a source document before confirming dishes.',
    })
  }

  const source = record(sourceSnap.data() || {})
  const aiDraft = record(source.ai_draft)
  const sections = normalizeKitchenMenuDraftSections({ sections: aiDraft.sections })

  if (!sections.length || !countKitchenMenuDraftItems(sections)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm needs at least one dish in the menu draft.',
    })
  }

  const duplicateOptionItems = sections.flatMap((section) =>
    section.items
      .filter((item) => {
        const addOns = item.add_ons.map(record)
        return hasDuplicates(item.price_options.map((option) => record(option).label)) ||
          hasDuplicates(addOns.map((option) => option.id)) ||
          hasDuplicates(addOns.map((option) => option.label))
      })
      .map((item) => item.name)
  )
  if (duplicateOptionItems.length) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Confirm blocked because option labels or identifiers are duplicated: ${duplicateOptionItems.join(', ')}.`,
    })
  }

  const kitchenPath = kitchenMenuUploadKitchenPath(appId, kitchenId)
  const current = await readKitchenMenuCurrentShape(kitchenPath, menuId)
  const comparison = compareKitchenMenuDraftToCurrent(current, sections)
  const optionLoss = comparison.flags.filter((flag) =>
    destructiveOptionFlagCodes.has(flag.code)
  )
  if (optionLoss.length) {
    throw createError({
      statusCode: 409,
      statusMessage:
        `Confirm blocked because the draft would remove existing variants or add-ons. Review: ${optionLoss.map((flag) => flag.item || flag.section || flag.code).join(', ')}.`,
    })
  }

  // Confirm is the commit point: before this, the upload is only a review source.
  const write = await writeKitchenMenuDraft({
    appId,
    kitchenId,
    kitchenPath,
    menuId,
    uid,
    sections,
  })
  const stamp = serverAuditStamp({ by: uid, appId })

  await sourceRef.set(
    {
      status: write.status === 'published' ? 'published' : 'draft',
      menu_id: menuId,
      ai_draft: {
        ...aiDraft,
        applied: {
          ...write,
          at: stamp.at,
          by: uid,
        },
      },
      updated: stamp,
    },
    { merge: true }
  )

  return {
    ok: true,
    menuId,
    uploadId,
    write,
    message: 'Menu draft confirmed. Dishes, sections, and menu items were created.',
  }
})
