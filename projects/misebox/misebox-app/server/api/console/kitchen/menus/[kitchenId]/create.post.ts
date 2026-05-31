import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import { createError, defineEventHandler, getRouterParam, readMultipartFormData, setResponseHeaders } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

const APP_ID = 'misebox-app'
const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const allowedFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const reservedSlugs = ['create', 'edit', 'index', 'new', 'qr', 'sections']

function fieldValue(parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

function normalizeBucketName(bucket?: string | null) {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

function safeFileName(value: unknown) {
  return String(value || 'menu')
    .trim()
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'menu'
}

function isAllowedFile(input: { fileName: string, fileType: string }) {
  const extension = input.fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  return allowedFileTypes.has(input.fileType) ||
    extension === '.pdf' ||
    extension === '.doc' ||
    extension === '.docx'
}

function firebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

function menuNameFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || slug
}

async function readKitchenPublicSlug(kitchenId: string) {
  const doc = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenId)
    .get()
  const data = doc.data() || {}
  return String(data.slug || '').trim()
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  })

  const kitchenId = String(getRouterParam(event, 'kitchenId') || '').trim()
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeSlug(fieldValue(parts, 'slug'))

  if (!kitchenId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen id is required.',
    })
  }

  const validation = validatePublicSlug(slug, {
    label: 'Menu path',
    reservedScope: 'entity',
    reserved: reservedSlugs,
  })
  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu path is not valid.',
    })
  }

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu file is required.',
    })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB.`,
    })
  }

  const fileType = String(filePart.type || 'application/octet-stream')
  const fileName = safeFileName(filePart.filename || 'menu')
  if (!isAllowedFile({ fileName, fileType })) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Upload a PDF, DOC, or DOCX menu file.',
    })
  }

  const db = getRuntimeFirestore()
  const menuRef = db
    .collection('apps')
    .doc(APP_ID)
    .collection('kitchens')
    .doc(kitchenId)
    .collection('menus')
    .doc(slug)
  const existing = await menuRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This menu path is already taken.',
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

  const token = randomUUID()
  const objectPath = `apps/${APP_ID}/kitchens/${kitchenId}/menus/${slug}/source/${fileName}`
  await getStorage(getAdminApp()).bucket(bucketName).file(objectPath).save(filePart.data, {
    resumable: false,
    metadata: {
      contentType: fileType,
      cacheControl: 'public, max-age=300',
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })

  const docUrl = firebaseDownloadUrl(bucketName, objectPath, token)
  const kitchenSlug = await readKitchenPublicSlug(kitchenId)
  if (!kitchenSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kitchen needs a public slug before menu import.',
    })
  }
  const publicMenuPath = `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(slug)}`
  const now = FieldValue.serverTimestamp()
  await menuRef.set({
    id: slug,
    kitchen_id: kitchenId,
    name: menuNameFromSlug(slug),
    description: '',
    source_language: '',
    status: 'published',
    doc_url: docUrl,
    doc_name: fileName,
    doc_type: fileType,
    doc_storage_path: objectPath,
    created: {
      at: now,
      by: 'console',
      app_id: APP_ID,
    },
    updated: {
      at: now,
      by: 'console',
    },
  })

  return {
    ok: true,
    id: slug,
    slug,
    path: publicMenuPath,
    url: publicMenuPath,
    qr_path: publicMenuPath,
    qr_url: publicMenuPath,
    storage_owner: 'misebox',
    powered_by: {
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: 'https://go-qr.web.app/img/app/logo.svg',
    },
  }
})
