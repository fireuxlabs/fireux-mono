import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { writeKitchenMenuDraft } from '../../../../utils/kitchen-menu-draft-write'
import {
  countKitchenMenuDraftItems,
  normalizeKitchenMenuDraftSections,
} from '../../../../utils/kitchen-menu-draft-sections'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadKitchenPath,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../utils/kitchen-menu-uploads'

type ConfirmMenuBody = Partial<Record<'appId' | 'kitchenId' | 'menuId' | 'uploadId', string>> & {
  confirmDishes?: boolean
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

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

  const kitchenPath = kitchenMenuUploadKitchenPath(appId, kitchenId)
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
