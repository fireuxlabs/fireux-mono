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
import {
  isKitchenMenuDocumentPath,
  menuDocumentContentTypes,
} from '../../../../menu/server/document/file'

export default defineEventHandler(async (event) => {
  const menuId = String(getRouterParam(event, 'menuId') || '').trim()
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const target = await resolveMenuTarget(menuId, getQuery(event).kitchenSlug)
  const data = target.menuData
  if (
    readRecordString(data, 'status') !== 'published' ||
    data.schedule === 'daily'
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }
  const file = readRecord(data.doc)
  const objectPath = readRecordString(file, 'storage_path')
  const contentType = readRecordString(file, 'type')
  const inline = menuDocumentContentTypes.includes(contentType)
  const fileName = readRecordString(file, 'name') || menuId
  const safeFileName =
    fileName
      .replace(/[\r\n"\\]/g, '')
      .trim()
      .replace(/[^\x20-\x7E]/g, '_') || menuId

  if (
    !isKitchenMenuDocumentPath(
      objectPath,
      target.kitchenId,
      target.rootKitchenData
    )
  ) {
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
    'Content-Type': inline ? contentType : 'application/octet-stream',
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${safeFileName}"`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  })

  return saved.buffer
})
