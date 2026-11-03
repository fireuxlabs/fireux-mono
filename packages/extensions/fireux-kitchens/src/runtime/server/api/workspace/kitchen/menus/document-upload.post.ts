import { defineEventHandler, createError } from 'h3'
import { saveKitchenDocumentMenu } from '../../../../../menu/server/document/save'
import {
  assertKitchenMenuUploadAccess,
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  setKitchenMenuUploadCors,
} from '../../../../../menu/server/source/uploads'

/** Upload a guest-facing document; import sources and AI processing are separate. */
export default defineEventHandler(async (event) => {
  setKitchenMenuUploadCors(event, 'POST')
  const uid = await requireKitchenMenuUploadUser(event)
  const request = await readKitchenMenuUploadRequest(event)
  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)
  if (request.files.length !== 1)
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose one PDF or image for this Menu.',
    })
  const saved = await saveKitchenDocumentMenu(event, {
    kitchenId: request.kitchenId,
    menuId: request.uploadId,
    files: request.files,
  })
  return {
    ok: true,
    id: saved.menuId,
    url: saved.document!.url,
    file_name: saved.document!.name,
    file_type: saved.document!.type,
  }
})
