import { defineEventHandler, createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { updateKitchenMenu } from '../../../../../menu/server/records/update'
import {
  assertKitchenMenuUploadAccess,
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  saveKitchenMenuUploadFiles,
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
  const menuId = request.uploadId
  // Retain the previous published file until the metadata command succeeds.
  const [file] = await saveKitchenMenuUploadFiles({
    ...request,
    uploadId: randomUUID(),
  })
  await updateKitchenMenu(event, {
    kitchenId: request.kitchenId,
    menuId,
    changes: {
      doc: {
        url: file.fileUrl,
        name: file.fileName,
        type: file.contentType,
        storage_path: file.objectPath,
      },
    },
  })
  return {
    ok: true,
    id: menuId,
    url: file.fileUrl,
    file_name: file.fileName,
    file_type: file.contentType,
  }
})
