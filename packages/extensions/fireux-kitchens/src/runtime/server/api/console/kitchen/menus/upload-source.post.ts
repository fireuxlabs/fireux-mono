import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import {
  createError,
  defineEventHandler,
  getHeader,
  getMethod,
  getQuery,
  getRequestURL,
  readMultipartFormData,
  setResponseHeaders,
  setResponseStatus,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { KitchenStorage } from '../../../../../models/kitchen.model'

const menuUploadCollection = 'menu-uploads'
const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const allowedTypes = new Set(['application/pdf'])

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function fieldValue(parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

function bearerToken(value: unknown) {
  return text(value).match(/^Bearer\s+(.+)$/i)?.[1] || ''
}

function normalizeBucketName(bucket?: string | null) {
  const trimmed = text(bucket)
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

function pathSegment(value: unknown, label: string) {
  const segment = text(value)
  if (!segment || segment.includes('/')) {
    throw createError({ statusCode: 400, statusMessage: `${label} is required.` })
  }
  return segment
}

function safeFileName(value: unknown) {
  return text(value || 'menu.pdf')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'menu.pdf'
}

function firebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

function hasOperator(data: Record<string, unknown> | undefined, uid: string) {
  const ids = [
    ...(Array.isArray(data?.operator_ids) ? data.operator_ids : []),
    ...(Array.isArray(data?.team_ids) ? data.team_ids : []),
  ].map((value) => text(value))

  return Boolean(uid && ids.includes(uid))
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization',
  })
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return null
  }

  const token = bearerToken(getHeader(event, 'authorization'))
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in before saving a menu upload.' })
  }

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
  const uid = pathSegment(decoded.uid, 'User id')
  const query = getQuery(event)
  const parts = await readMultipartFormData(event)
  const appId = pathSegment(fieldValue(parts, 'appId') || query.appId, 'App id')
  const kitchenId = pathSegment(fieldValue(parts, 'kitchenId') || query.kitchenId, 'Kitchen id')
  const uploadId = normalizeSlug(fieldValue(parts, 'slug'))
  const validation = validatePublicSlug(uploadId, {
    label: 'Menu source path',
    reservedScope: 'entity',
    reserved: ['create', 'edit', 'new', 'qr', 'sections'],
  })

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu source path is not valid.',
    })
  }

  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  if (!filePart?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Menu source PDF is required.' })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB.`,
    })
  }

  const fileType = text(filePart.type || 'application/octet-stream')
  const fileName = safeFileName(filePart.filename)
  if (!allowedTypes.has(fileType) && !fileName.toLowerCase().endsWith('.pdf')) {
    throw createError({ statusCode: 415, statusMessage: 'Upload a PDF menu source file.' })
  }
  const storedFileType = fileName.toLowerCase().endsWith('.pdf')
    ? 'application/pdf'
    : fileType

  const db = getRuntimeFirestore()
  const kitchenPath = `${AppStorage.collection}/${appId}/${KitchenStorage.scopeCollection}/${kitchenId}`
  const kitchenSnap = await db.doc(kitchenPath).get()
  if (!kitchenSnap.exists || !hasOperator(kitchenSnap.data(), uid)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this kitchen.',
    })
  }

  const uploadRef = db.doc(`${kitchenPath}/${menuUploadCollection}/${uploadId}`)
  const uploadSnap = await uploadRef.get()
  if (uploadSnap.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This menu source path is already taken.',
    })
  }

  const runtime = useRuntimeConfig()
  const bucketName = normalizeBucketName(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket
  )
  if (!bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase Storage bucket configuration.',
    })
  }

  const downloadToken = randomUUID()
  const objectPath = `${AppStorage.collection}/${appId}/${KitchenStorage.scopeCollection}/${kitchenId}/${menuUploadCollection}/${uploadId}/source/${fileName}`
  await getStorage(getAdminApp()).bucket(bucketName).file(objectPath).save(filePart.data, {
    resumable: false,
    metadata: {
      contentType: storedFileType,
      cacheControl: 'public, max-age=300',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  const now = FieldValue.serverTimestamp()
  const fileUrl = firebaseDownloadUrl(bucketName, objectPath, downloadToken)
  const publicPath = `/console/kitchen/menus/uploads/${encodeURIComponent(uploadId)}`
  const publicUrl = new URL(publicPath, getRequestURL(event).origin).toString()
  const upload = {
    id: uploadId,
    kitchen_id: kitchenId,
    app_id: appId,
    provider: 'go-qr',
    tool: 'doc',
    storage_owner: 'consumer',
    file_url: fileUrl,
    file_name: fileName,
    file_type: storedFileType,
    storage_path: objectPath,
    status: 'uploaded',
    created: {
      at: now,
      by: uid,
      app_id: appId,
    },
    updated: {
      at: now,
      by: uid,
    },
  }

  await uploadRef.create(upload)

  return {
    ok: true,
    id: uploadId,
    slug: uploadId,
    path: publicPath,
    qr_path: '',
    url: publicUrl,
    qr_url: '',
    file_name: fileName,
    file_type: storedFileType,
    storage_owner: 'consumer',
  }
})
