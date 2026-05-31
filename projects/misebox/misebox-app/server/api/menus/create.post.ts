import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import {
  createError,
  defineEventHandler,
  getRequestURL,
  readMultipartFormData,
  setResponseHeaders,
} from 'h3'
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
const reservedSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'console',
  'help',
  'menus',
  'pricing',
  'privacy',
  'solutions',
  'terms',
]

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
    .replace(/[^\w.-]+/g, '-')
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

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  })

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeSlug(fieldValue(parts, 'slug'))
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
  const menuRef = db.collection('menus').doc(slug)
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
  const objectPath = `menus/${slug}/source/${fileName}`
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
  const now = FieldValue.serverTimestamp()
  await menuRef.set({
    id: slug,
    kitchen_id: '',
    name: menuNameFromSlug(slug),
    description: '',
    status: 'published',
    doc_url: docUrl,
    doc_name: fileName,
    doc_type: fileType,
    doc_storage_path: objectPath,
    created: {
      at: now,
      by: 'anonymous',
      app_id: APP_ID,
    },
    updated: {
      at: now,
      by: 'anonymous',
    },
  })

  const baseUrl = getRequestURL(event).origin
  const path = `/menus/${encodeURIComponent(slug)}`
  const qrPath = `${path}/qr`

  return {
    ok: true,
    id: slug,
    slug,
    path,
    qr_path: qrPath,
    url: `${baseUrl}${path}`,
    qr_url: `${baseUrl}${qrPath}`,
    storage_owner: 'misebox',
    powered_by: {
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: 'https://go-qr.web.app/img/app/logo.svg',
    },
  }
})
