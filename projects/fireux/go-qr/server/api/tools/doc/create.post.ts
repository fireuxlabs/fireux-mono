import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import { createError, readMultipartFormData } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import {
  goQrDocQrUrl,
  goQrDocRef,
  goQrDocUrl,
  normalizeGoQrDocSlug,
  validateGoQrDocSlug,
} from '../../../utils/goQrDocs'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const allowedTypes = new Set([
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
  return String(value || 'doc')
    .trim()
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doc'
}

function isAllowedFile(input: { fileName: string, fileType: string }) {
  const extension = input.fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  return allowedTypes.has(input.fileType) ||
    input.fileType.startsWith('image/') ||
    extension === '.pdf' ||
    extension === '.doc' ||
    extension === '.docx'
}

function firebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || slug
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeGoQrDocSlug(fieldValue(parts, 'slug'))
  const validation = validateGoQrDocSlug(slug)

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Doc path is not valid.',
    })
  }

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Doc file is required.',
    })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB.`,
    })
  }

  const fileType = String(filePart.type || 'application/octet-stream')
  const fileName = safeFileName(filePart.filename || 'doc')
  if (!isAllowedFile({ fileName, fileType })) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Upload a PDF, image, DOC, or DOCX file.',
    })
  }

  const docRef = goQrDocRef(slug)
  const existing = await docRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This doc path is already taken.',
    })
  }

  const runtime = useRuntimeConfig()
  const bucketName = normalizeBucketName(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket
  )
  if (!bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Go QR Firebase Storage bucket configuration.',
    })
  }

  const token = randomUUID()
  const objectPath = `go-qr/docs/${slug}/${fileName}`
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
  const fileUrl = firebaseDownloadUrl(bucketName, objectPath, token)
  const title = titleFromSlug(slug)

  await docRef.create({
    id: slug,
    slug,
    title,
    status: 'published',
    source_type: 'storage_file',
    storage_owner: 'go-qr',
    file_url: fileUrl,
    file_name: fileName,
    file_type: fileType,
    storage_path: objectPath,
    display_label: title,
    qr_centre_label: 'Q',
    created: {
      at: now,
      by: 'anonymous',
    },
    updated: {
      at: now,
      by: 'anonymous',
    },
  })

  return {
    ok: true,
    id: slug,
    slug,
    path: `/doc/${encodeURIComponent(slug)}`,
    qr_path: `/doc/${encodeURIComponent(slug)}/qr`,
    url: goQrDocUrl(slug),
    qr_url: goQrDocQrUrl(slug),
  }
})
