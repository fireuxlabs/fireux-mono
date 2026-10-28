import { defineEventHandler, type H3Event } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverCreate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-create'
import { serverUpdate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-update'
import { serverKitchenMenuUploadsTarget } from '../../../../../kitchen/server/mutation-targets'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuUploadAvailable,
  assertKitchenMenuCurrencyCode,
  kitchenMenuUploadPath,
  requireKitchenMenuUploadUser,
  storagePathsFromMenuUpload,
} from '../../../../../menu/server/source/uploads'
import {
  kitchenMenuUrlSourceRecord,
  readKitchenMenuUrlSourceRequest,
} from '../../../../../menu/server/source/url-sources'

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

  const uploadRef = getRuntimeFirestore().doc(
    kitchenMenuUploadPath(request.appId, request.kitchenId, request.uploadId)
  )
  const existingSnap = request.replaceExisting ? await uploadRef.get() : null
  const existingStoragePaths = existingSnap?.exists
    ? storagePathsFromMenuUpload(existingSnap.data())
    : []

  if (request.replaceExisting && existingSnap?.exists) {
    await Promise.all(
      existingStoragePaths.map((objectPath) =>
        deleteStorageFileIfExists({ objectPath })
      )
    )
  }

  const record = kitchenMenuUrlSourceRecord(request, uid)
  const uploads = serverKitchenMenuUploadsTarget(request.kitchenId)
  if (request.replaceExisting && existingSnap?.exists) {
    await serverUpdate(uploads, request.uploadId, {
      ...record,
      ai_draft: FieldValue.delete(),
      menu_id: FieldValue.delete(),
    })
  } else {
    await serverCreate(uploads, request.uploadId, record)
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
