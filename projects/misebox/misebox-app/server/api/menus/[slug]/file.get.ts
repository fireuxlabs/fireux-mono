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
  normalizePublicMenuSlug,
  readPublicMenuRecord,
} from '../../../utils/menuPublicRecords'

function normalizeBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

export default defineEventHandler(async (event) => {
  const slug = normalizePublicMenuSlug(getRouterParam(event, 'slug'))
  const record = await readPublicMenuRecord(slug)

  if (!record || record.is_public === false) {
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

  const storagePath = record.doc_storage_path || record.storage_path
  if (!storagePath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu file not found',
    })
  }

  const storageFile = getStorage(getAdminApp()).bucket(bucketName).file(storagePath)
  const [exists] = await storageFile.exists()

  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu file not found',
    })
  }

  setHeader(event, 'content-type', record.doc_type || record.file_type || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=300')
  setHeader(
    event,
    'content-disposition',
    `inline; filename="${(record.doc_name || record.file_name || 'menu').replace(/"/g, '')}"`
  )

  return sendStream(event, storageFile.createReadStream())
})
