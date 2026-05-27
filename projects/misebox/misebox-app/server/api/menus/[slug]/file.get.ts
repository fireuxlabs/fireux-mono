import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getRouterParam,
  sendStream,
  setHeader,
} from 'h3'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import {
  normalizeMenuQrSlug,
  readMenuDocument,
} from '../../../utils/menuQrDocuments'

function normalizeBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

export default defineEventHandler(async (event) => {
  const slug = normalizeMenuQrSlug(getRouterParam(event, 'slug'))
  const record = await readMenuDocument(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found',
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

  const storageFile = getStorage(getAdminApp()).bucket(bucketName).file(record.storage_path)
  const [exists] = await storageFile.exists()

  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu file not found',
    })
  }

  setHeader(event, 'content-type', record.file_type || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=300')
  setHeader(
    event,
    'content-disposition',
    `inline; filename="${record.file_name.replace(/"/g, '')}"`
  )

  return sendStream(event, storageFile.createReadStream())
})
