import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  downloadStorageFile,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import { MenuStorage } from '../../../../models/kitchen/menu/menu.model.ts'

export default defineEventHandler(async (event) => {
  const menuId = String(getRouterParam(event, 'menuId') || '').trim()
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const snap = await getRuntimeFirestore()
    .collection(MenuStorage.rootCollection)
    .doc(menuId)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  const file = readRecord(data.file)
  const objectPath = readRecordString(file, 'storage_path')
  const contentType =
    readRecordString(file, 'type') || 'application/octet-stream'
  const fileName = readRecordString(file, 'name') || `${menuId}.pdf`

  if (!objectPath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu file not found.',
    })
  }

  const saved = await downloadStorageFile({
    bucketName: runtimeStorageBucketName(
      'Missing Firebase Storage bucket configuration.'
    ),
    objectPath,
  })

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${fileName.replace(/"/g, '')}"`,
    'Cache-Control': 'public, max-age=300',
  })

  return saved.buffer
})
