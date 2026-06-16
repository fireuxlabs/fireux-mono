import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  downloadStorageFile,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage.ts'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const snap = await getRuntimeFirestore()
    .collection('menus')
    .doc(slug)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  const objectPath = String(data.doc_storage_path || '').trim()
  const contentType = String(data.doc_type || 'application/octet-stream').trim()
  const fileName = String(data.doc_name || `${slug}.pdf`).trim()

  if (!objectPath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu file not found.',
    })
  }

  const saved = await downloadStorageFile({
    bucketName: runtimeStorageBucketName(
      'Missing Misebox Firebase Storage bucket configuration.'
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
