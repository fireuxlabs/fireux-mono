import {
  createError,
  defineEventHandler,
  readMultipartFormData,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import {
  multipartField,
  readUploadedMultipartFile,
} from 'fireux-core/runtime/server/utils/uploads/multipart.ts'
import {
  runtimeStorageBucketName,
  saveStorageFileWithDownloadToken,
} from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import {
  goQrDocQrUrl,
  goQrDocRef,
  goQrDocUrl,
  normalizeGoQrDocSlug,
  validateGoQrDocSlug,
} from '../../../utils/goQrDocs'

const maxFileSizeMb = 10
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const extensionTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
  const slug = normalizeGoQrDocSlug(multipartField(parts, 'slug'))
  const validation = validateGoQrDocSlug(slug)

  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Doc path is not valid.',
    })
  }

  const file = readUploadedMultipartFile(parts, {
    label: 'Doc file',
    defaultFileName: 'doc',
    maxFileSizeMb,
    allowedTypes,
    extensionTypes,
    allowImageTypes: true,
    invalidTypeMessage: 'Upload a PDF, image, DOC, or DOCX file.',
  })

  const docRef = goQrDocRef(slug)
  const existing = await docRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This doc path is already taken.',
    })
  }

  const objectPath = `go-qr/docs/${slug}/${file.fileName}`
  const saved = await saveStorageFileWithDownloadToken({
    bucketName: runtimeStorageBucketName(
      'Missing Go QR Firebase Storage bucket configuration.'
    ),
    objectPath,
    data: file.data,
    contentType: file.contentType,
  })

  const now = FieldValue.serverTimestamp()
  const title = titleFromSlug(slug)

  await docRef.create({
    id: slug,
    slug,
    title,
    status: 'published',
    source_type: 'storage_file',
    storage_owner: 'go-qr',
    file_url: saved.fileUrl,
    file_name: file.fileName,
    file_type: file.contentType,
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
    file_name: file.fileName,
    file_type: file.contentType,
  }
})
