import { defineEventHandler, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuUploadAvailable,
  kitchenMenuUploadPath,
  kitchenMenuUploadRecord,
  kitchenMenuUploadResponse,
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  saveKitchenMenuUploadFile,
  setKitchenMenuUploadCors,
} from '../../../../utils/kitchen-menu-uploads'

export default defineEventHandler(async (event: H3Event) => {
  setKitchenMenuUploadCors(event, 'POST')

  const uid = await requireKitchenMenuUploadUser(event)
  const request = await readKitchenMenuUploadRequest(event)

  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)
  await assertKitchenMenuUploadAvailable(
    request.appId,
    request.kitchenId,
    request.uploadId
  )

  const saved = await saveKitchenMenuUploadFile(request)
  await getRuntimeFirestore()
    .doc(kitchenMenuUploadPath(request.appId, request.kitchenId, request.uploadId))
    .create(kitchenMenuUploadRecord(request, saved, uid))

  return kitchenMenuUploadResponse(request, saved)
})
