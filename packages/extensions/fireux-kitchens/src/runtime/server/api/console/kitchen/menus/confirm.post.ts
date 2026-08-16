import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readString } from 'fireux-core/runtime/server/utils/records/read'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  serverKitchenDishesTarget,
  serverKitchenMenuUploadsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
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
import { importKitchenMenuCacheUnits } from '../../../../menu/sproochli/cache-import'
import {
  normalizeMenuMediaReview,
  menuMediaReviewKey,
} from '../../../../menu/media/review'
import { fetchPublicRasterImage } from 'fireux-core/runtime/server/utils/http/public-raster-image'
import { normalizeAndSaveDishImage } from '../../../../dish/image'

type ConfirmMenuBody = Partial<
  Record<'appId' | 'kitchenId' | 'menuId' | 'uploadId', string>
> & {
  confirmDishes?: boolean
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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
  const sections = normalizeKitchenMenuDraftSections({
    sections: aiDraft.sections,
  })
  const mediaReview = normalizeMenuMediaReview(aiDraft.media_review)

  if (!sections.length || !countKitchenMenuDraftItems(sections)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm needs at least one dish in the menu draft.',
    })
  }

  const missingMediaDecisions = sections.flatMap((section, sectionIndex) =>
    section.items.flatMap((item, itemIndex) =>
      mediaReview[menuMediaReviewKey(sectionIndex, itemIndex)]
        ? []
        : [item.name]
    )
  )
  if (missingMediaDecisions.length) {
    throw createError({
      statusCode: 409,
      statusMessage: `Review Dish media before confirming: ${missingMediaDecisions.join(', ')}.`,
    })
  }
  const queuedAiMedia = Object.values(mediaReview).filter(
    (decision) =>
      decision.action === 'generate' || decision.action === 'reprocess-ai'
  )
  if (queuedAiMedia.length) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Generate or reprocess the selected Dish media before confirming the menu.',
    })
  }

  const duplicateOptionItems = sections.flatMap((section) =>
    section.items
      .filter((item) => {
        const addOns = item.add_ons.map(record)
        return (
          hasDuplicates(
            item.price_options.map((option) => record(option).label)
          ) ||
          hasDuplicates(addOns.map((option) => option.id)) ||
          hasDuplicates(addOns.map((option) => option.label))
        )
      })
      .map((item) => item.name)
  )
  if (duplicateOptionItems.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Confirm blocked because option labels or identifiers are duplicated: ${duplicateOptionItems.join(', ')}.`,
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
      statusMessage: `Confirm blocked because the draft would remove existing variants or add-ons. Review: ${optionLoss.map((flag) => flag.item || flag.section || flag.code).join(', ')}.`,
    })
  }

  // Confirm is the commit point: before this, the upload is only a review source.
  const writeResult = await writeKitchenMenuDraft({
    appId,
    kitchenId,
    kitchenPath,
    menuId,
    uid,
    sections,
  })
  const {
    sproochliCacheUnits,
    dish_targets: dishTargets,
    ...write
  } = writeResult
  const mediaApplied: Array<{ dish_id: string; image: string }> = []
  for (const target of dishTargets) {
    const decision = mediaReview[target.review_key]
    if (decision?.action !== 'keep' || !decision.candidate_url) continue
    const fetched = await fetchPublicRasterImage(decision.candidate_url)
    const saved = await normalizeAndSaveDishImage({
      appId,
      kitchenId,
      dishId: target.dish_id,
      data: fetched.buffer,
    })
    try {
      await serverUpdate(
        serverKitchenDishesTarget(appId, kitchenId),
        target.dish_id,
        {
          image: saved.imageUrl,
          updated: serverAuditStamp({ by: uid, appId }),
        }
      )
      mediaApplied.push({ dish_id: target.dish_id, image: saved.imageUrl })
    } catch (cause) {
      await saved.deleteUploaded().catch(() => undefined)
      throw cause
    }
  }
  const provenance = record(aiDraft.provenance)
  let cacheImport:
    | Awaited<ReturnType<typeof importKitchenMenuCacheUnits>>
    | {
        status: 'failed'
        units: number
        writes: 0
        existing: 0
        reason: string
      }

  try {
    cacheImport = await importKitchenMenuCacheUnits({
      appId,
      uploadId,
      provider: readString(provenance.provider) || 'fireux-ai-menu-extraction',
      model: readString(provenance.model),
      units: sproochliCacheUnits,
    })
  } catch (cause) {
    cacheImport = {
      status: 'failed',
      units: sproochliCacheUnits.length,
      writes: 0,
      existing: 0,
      reason:
        (cause instanceof Error ? cause.message : String(cause)).slice(
          0,
          300
        ) || 'Sproochli Menu cache import failed.',
    }
  }
  const stamp = serverAuditStamp({ by: uid, appId })

  await serverUpdate(
    serverKitchenMenuUploadsTarget(appId, kitchenId),
    uploadId,
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
        cache_import: {
          ...cacheImport,
          at: stamp.at,
        },
        media_applied: mediaApplied,
      },
      updated: stamp,
    }
  )

  return {
    ok: true,
    menuId,
    uploadId,
    write,
    cacheImport,
    mediaApplied,
    message:
      'Menu draft confirmed. Dishes, sections, and menu items were created.',
  }
})
