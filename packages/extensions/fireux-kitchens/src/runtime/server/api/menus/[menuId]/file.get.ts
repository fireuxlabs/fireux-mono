import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'
import {
  downloadStorageFile,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { resolveMenuTarget } from '../../../../menu/server/ownership/target.ts'

export default defineEventHandler(async (event) => {
  const menuId = String(getRouterParam(event, 'menuId') || '').trim()
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const target = await resolveMenuTarget(
    menuId,
    getQuery(event).kitchenSlug
  )
  const data =
    target.kind === 'root-doorway' ? target.rootMenuData : target.menuData
  if (readRecordString(data, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }
  const file = readRecord(data.file)
  const objectPath = readRecordString(file, 'storage_path')
  const contentType =
    readRecordString(file, 'type') || 'application/octet-stream'
  const fileName = readRecordString(file, 'name') || menuId
  const safeFileName =
    fileName
      .replace(/[\r\n"]/g, '')
      .trim()
      .replace(/[^\x20-\x7E]/g, '_') || menuId

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
    'Content-Disposition': `inline; filename="${safeFileName}"`,
    'Cache-Control': 'public, max-age=300',
  })

  return saved.buffer
})
