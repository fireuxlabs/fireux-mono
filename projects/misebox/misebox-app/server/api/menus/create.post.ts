import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import { createError, readMultipartFormData } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import {
  normalizePublicMenuSlug,
  publicMenuQrUrl,
  publicMenuUrl,
  rootMenuDocumentRef,
  validatePublicMenuSlug,
} from '../../utils/menuPublicRecords'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const allowedFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

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

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizePublicMenuSlug(fieldValue(parts, 'slug'))
  const validation = validatePublicMenuSlug(slug)

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

  const menuRef = rootMenuDocumentRef(slug)
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
  const objectPath = `misebox/menu-qr/${slug}/${fileName}`
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

  const now = FieldValue.serverTimestamp()
  const docUrl = firebaseDownloadUrl(bucketName, objectPath, token)
  const name = menuNameFromSlug(slug)

  await menuRef.create({
    id: slug,
    slug,
    name,
    title: name,
    description: '',
    status: 'published',
    source_type: 'storage_file',
    source_app: 'misebox',
    storage_owner: 'misebox',
    is_public: true,
    doc_url: docUrl,
    doc_name: fileName,
    doc_type: fileType,
    doc_storage_path: objectPath,
    created: {
      at: now,
      by: 'anonymous',
    },
    updated: {
      at: now,
      by: 'anonymous',
    },
    created_at: now,
    updated_at: now,
  })

  return {
    ok: true,
    id: slug,
    slug,
    path: `/menus/${encodeURIComponent(slug)}`,
    qr_path: `/menus/${encodeURIComponent(slug)}/qr`,
    url: publicMenuUrl(slug),
    qr_url: publicMenuQrUrl(slug),
  }
})
