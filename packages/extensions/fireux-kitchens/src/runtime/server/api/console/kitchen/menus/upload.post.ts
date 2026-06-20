import { defineEventHandler, type H3Event } from 'h3'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  assertKitchenMenuUploadAccess,
  assertKitchenMenuUploadAvailable,
  kitchenMenuUploadPath,
  kitchenMenuUploadRecord,
  kitchenMenuUploadResponse,
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  saveKitchenMenuUploadFiles,
  setKitchenMenuUploadCors,
} from '../../../../utils/kitchen-menu-uploads'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const storagePathsFromUpload = (value: unknown) => {
  const source = record(value)
  const paths = new Set<string>()
  const primary = text(source.storage_path)
  if (primary) paths.add(primary)

  if (Array.isArray(source.files)) {
    for (const file of source.files) {
      const path = text(record(file).storage_path)
      if (path) paths.add(path)
    }
  }

  return Array.from(paths)
}

export default defineEventHandler(async (event: H3Event) => {
  setKitchenMenuUploadCors(event, 'POST')

  const uid = await requireKitchenMenuUploadUser(event)
  const request = await readKitchenMenuUploadRequest(event)

  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)
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
    ? storagePathsFromUpload(existingSnap.data())
    : []
  const savedFiles = await saveKitchenMenuUploadFiles(request)
  const savedStoragePaths = new Set(savedFiles.map((file) => file.objectPath))
  if (request.replaceExisting) {
    await Promise.all(
      existingStoragePaths
        .filter((path) => !savedStoragePaths.has(path))
        .map((objectPath) => deleteStorageFileIfExists({ objectPath }))
    )
  }

  const record = kitchenMenuUploadRecord(request, savedFiles, uid)
  if (request.replaceExisting) {
    await uploadRef.set(record)
  } else {
    await uploadRef.create(record)
  }

  return kitchenMenuUploadResponse(request, savedFiles)
})
