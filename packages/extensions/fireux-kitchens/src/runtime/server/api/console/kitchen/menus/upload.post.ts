import { defineEventHandler, type H3Event } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverCreate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-create'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { serverKitchenMenuUploadsTarget } from '../../../../kitchen/firestore-targets'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuUploadAvailable,
  assertKitchenMenuCurrencyCode,
  kitchenMenuUploadPath,
  kitchenMenuUploadRecord,
  kitchenMenuUploadResponse,
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  saveKitchenMenuUploadFiles,
  setKitchenMenuUploadCors,
  storagePathsFromMenuUpload,
} from '../../../../menu/source/uploads'

export default defineEventHandler(async (event: H3Event) => {
  setKitchenMenuUploadCors(event, 'POST')

  const uid = await requireKitchenMenuUploadUser(event)
  const request = await readKitchenMenuUploadRequest(event)

  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)
  await assertKitchenMenuCurrencyCode(request.appId, request.kitchenId)
  if (!request.replaceExisting) {
    await assertKitchenMenuUploadAvailable(
      request.appId,
      request.kitchenId,
      request.uploadId
    )
  }

  const uploadRef = getRuntimeFirestore().doc(
    kitchenMenuUploadPath(request.appId, request.kitchenId, request.uploadId)
  )
  const existingSnap = request.replaceExisting ? await uploadRef.get() : null
  const existingStoragePaths = existingSnap?.exists
    ? storagePathsFromMenuUpload(existingSnap.data())
    : []
  const savedFiles = await saveKitchenMenuUploadFiles(request)
  const savedStoragePaths = new Set(savedFiles.map((file) => file.objectPath))
  if (request.replaceExisting && existingSnap?.exists) {
    await Promise.all(
      existingStoragePaths
        .filter((path) => !savedStoragePaths.has(path))
        .map((objectPath) => deleteStorageFileIfExists({ objectPath }))
    )
  }

  const record = kitchenMenuUploadRecord(request, savedFiles, uid)
  const uploads = serverKitchenMenuUploadsTarget(
    request.appId,
    request.kitchenId
  )
  if (request.replaceExisting && existingSnap?.exists) {
    await serverUpdate(uploads, request.uploadId, {
      ...record,
      source_url: FieldValue.delete(),
      source_provider: FieldValue.delete(),
      ai_draft: FieldValue.delete(),
      menu_id: FieldValue.delete(),
    })
  } else {
    await serverCreate(uploads, request.uploadId, record)
  }

  return kitchenMenuUploadResponse(request, savedFiles)
})
