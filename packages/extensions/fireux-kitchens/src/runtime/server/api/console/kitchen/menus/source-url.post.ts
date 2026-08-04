import { defineEventHandler, type H3Event } from 'h3'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuUploadAvailable,
  assertKitchenMenuCurrencyCode,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
  storagePathsFromMenuUpload,
} from '../../../../menu/source/uploads'
import {
  kitchenMenuUrlSourceRecord,
  readKitchenMenuUrlSourceRequest,
} from '../../../../menu/source/url-sources'

export default defineEventHandler(async (event: H3Event) => {
  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before saving a menu URL.'
  )
  const request = await readKitchenMenuUrlSourceRequest(event)

  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)
  await assertKitchenMenuCurrencyCode(request.appId, request.kitchenId)
  if (!request.replaceExisting) {
    await assertKitchenMenuUploadAvailable(
      request.appId,
      request.kitchenId,
      request.uploadId
    )
  }

  const uploadRef = getRuntimeFirestore()
    .doc(kitchenMenuUploadPath(request.appId, request.kitchenId, request.uploadId))
  const existingSnap = request.replaceExisting ? await uploadRef.get() : null
  const existingStoragePaths = existingSnap?.exists
    ? storagePathsFromMenuUpload(existingSnap.data())
    : []

  if (request.replaceExisting) {
    await Promise.all(
      existingStoragePaths.map((objectPath) =>
        deleteStorageFileIfExists({ objectPath })
      )
    )
  }

  const record = kitchenMenuUrlSourceRecord(request, uid)
  if (request.replaceExisting) {
    await uploadRef.set(record)
  } else {
    await uploadRef.create(record)
  }

  return {
    ok: true,
    id: request.uploadId,
    slug: request.uploadId,
    source_url: request.sourceUrl,
    source_provider: request.sourceProvider,
    storage_owner: 'external',
    storage_app_id: request.appId,
  }
})
