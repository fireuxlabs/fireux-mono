import {
  createError,
  defineEventHandler,
  readBody,
  type H3Event,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  estimateMenuAiCost,
  type MenuAiQuality,
} from '../../../../utils/kitchen-menu-ai-cost'
import { fileRows } from '../../../../utils/kitchen-menu-process'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
} from '../../../../utils/kitchen-menu-uploads'

type ProcessEstimateBody = {
  appId?: string
  kitchenId?: string
  menuId?: string
  uploadId?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before estimating menu AI processing.'
  )
  const body = (await readBody(event)) as ProcessEstimateBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const uploadId = requirePathSegment(body?.uploadId || menuId, 'Upload id')

  await assertKitchenMenuUploadAccess(appId, kitchenId, uid)

  const sourceSnap = await getRuntimeFirestore()
    .doc(kitchenMenuUploadPath(appId, kitchenId, uploadId))
    .get()

  if (!sourceSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Upload a source document before estimating AI processing.',
    })
  }

  const files = fileRows(sourceSnap.data() || {})
  const estimate = (quality: MenuAiQuality) =>
    estimateMenuAiCost({ files, quality })

  return {
    ok: true,
    menu_id: menuId,
    upload_id: uploadId,
    estimates: {
      standard: estimate('standard'),
      strong: estimate('strong'),
    },
    billing: {
      owner: 'kitchen',
      app_id: appId,
      kitchen_id: kitchenId,
      confirmation_required: true,
    },
  }
})

