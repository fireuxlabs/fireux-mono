import { useRuntimeConfig } from '#imports'
import { randomUUID } from 'node:crypto'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import {
  createMenuDocument,
  menuDocumentRef,
  normalizeMenuQrSlug,
  validateMenuQrSlug,
} from '../../utils/menuQrDocuments'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
const allowedMenuFileTypes = new Set([
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

function safeStorageFileName(value: unknown) {
  return String(value || 'menu')
    .trim()
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'menu'
}

function isAllowedMenuFile(input: {
  fileName: string
  fileType: string
}) {
  const extension = input.fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  return allowedMenuFileTypes.has(input.fileType) ||
    extension === '.pdf' ||
    extension === '.doc' ||
    extension === '.docx'
}

function firebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

async function uploadMenuFileToMisebox(input: {
  slug: string
  fileName: string
  fileType: string
  data: Buffer
}) {
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
  const safeFileName = safeStorageFileName(input.fileName)
  const objectPath = `misebox/menu-qr/${input.slug}/${safeFileName}`

  await getStorage(getAdminApp()).bucket(bucketName).file(objectPath).save(input.data, {
    resumable: false,
    metadata: {
      contentType: input.fileType,
      cacheControl: 'public, max-age=300',
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })

  return {
    fileUrl: firebaseDownloadUrl(bucketName, objectPath, token),
    storagePath: objectPath,
    fileName: safeFileName,
  }
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeMenuQrSlug(fieldValue(parts, 'slug'))
  const validation = validateMenuQrSlug(slug)

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu URL is not valid',
    })
  }

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu file is required',
    })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB`,
    })
  }

  const existing = await menuDocumentRef(slug).get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This menu URL is already taken.',
    })
  }

  const fileType = String(filePart.type || 'application/octet-stream')
  const fileName = safeStorageFileName(filePart.filename || 'menu')

  if (!isAllowedMenuFile({ fileName, fileType })) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Upload a PDF, DOC, or DOCX menu file.',
    })
  }

  const uploaded = await uploadMenuFileToMisebox({
    slug,
    fileName,
    fileType,
    data: filePart.data,
  })
  const record = await createMenuDocument({
    slug,
    fileUrl: uploaded.fileUrl,
    fileType,
    fileName: uploaded.fileName,
    storagePath: uploaded.storagePath,
  })

  return {
    ok: true,
    id: record.id,
    slug: record.slug,
    path: `/menus/${encodeURIComponent(record.slug)}`,
    qr_path: `/menus/${encodeURIComponent(record.slug)}/qr`,
    url: `/menus/${encodeURIComponent(record.slug)}`,
    qr_url: `/menus/${encodeURIComponent(record.slug)}/qr`,
    storage_owner: 'misebox',
    powered_by: {
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: 'https://go-qr.web.app/img/app/logo.png',
    },
  }
})
