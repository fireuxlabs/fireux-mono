import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  createError,
  defineEventHandler,
  getRequestURL,
  readMultipartFormData,
} from 'h3'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  multipartField,
  readUploadedMultipartFile,
} from 'fireux-core/runtime/server/utils/uploads/multipart.ts'
import {
  runtimeStorageBucketName,
  saveStorageFileWithDownloadToken,
} from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

const maxFileSizeMb = 10
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]
const extensionTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}
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

function menuNameFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || slug
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST'],
  })

  const cfg = useFireUXConfig()
  const parts = await readMultipartFormData(event)
  const slug = normalizeSlug(multipartField(parts, 'slug'))
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

  const file = readUploadedMultipartFile(parts, {
    label: 'Menu file',
    defaultFileName: 'menu',
    maxFileSizeMb,
    allowedTypes: allowedFileTypes,
    extensionTypes,
    invalidTypeMessage: 'Upload a photo, PDF, DOC, or DOCX menu file.',
  })

  const db = getRuntimeFirestore()
  const menuRef = db.collection('menus').doc(slug)
  const existing = await menuRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This menu path is already taken.',
    })
  }

  const objectPath = `menus/${slug}/source/${file.fileName}`
  const saved = await saveStorageFileWithDownloadToken({
    bucketName: runtimeStorageBucketName(
      'Missing Firebase Storage bucket configuration.'
    ),
    objectPath,
    data: file.data,
    contentType: file.contentType,
  })

  await menuRef.set({
    id: slug,
    slug,
    kitchen_id: '',
    source_app_id: cfg.appId,
    name: menuNameFromSlug(slug),
    description: '',
    doc_url: saved.fileUrl,
    doc_name: file.fileName,
    doc_type: file.contentType,
    doc_kind: documentKindFromFile({
      fileName: file.fileName,
      contentType: file.contentType,
    }),
    doc_storage_path: objectPath,
    created: serverAuditStamp({ by: 'anonymous', appId: cfg.appId }),
    updated: serverAuditStamp({ by: 'anonymous', appId: cfg.appId }),
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
    storage_owner: cfg.appId,
    powered_by: {
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: 'https://go-qr.web.app/img/app/logo.svg',
    },
  }
})
