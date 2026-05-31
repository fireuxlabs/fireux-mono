import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

function normalizeBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

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

  const runtime = useRuntimeConfig()
  const bucketName = normalizeBucketName(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket
  )
  if (!bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Misebox Firebase Storage bucket configuration.',
    })
  }

  const [buffer] = await getStorage(getAdminApp())
    .bucket(bucketName)
    .file(objectPath)
    .download()

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${fileName.replace(/"/g, '')}"`,
    'Cache-Control': 'public, max-age=300',
  })

  return buffer
})
