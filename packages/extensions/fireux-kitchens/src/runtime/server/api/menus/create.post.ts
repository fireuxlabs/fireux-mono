import { useRuntimeConfig } from '#imports'
import { getAuth } from 'firebase-admin/auth'
import {
  createError,
  defineEventHandler,
  getRequestURL,
  readMultipartFormData,
  type H3Event,
} from 'h3'
import { bearerTokenFromEvent } from 'fireux-core/runtime/server/utils/auth/bearer'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  multipartField,
  readUploadedMultipartFile,
} from 'fireux-core/runtime/server/utils/uploads/multipart'
import {
  runtimeStorageBucketName,
  saveStorageFileWithDownloadToken,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverCreate } from 'fireux-core/runtime/server/utils/firestore-mutations/server-create'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'

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

function currentAppId() {
  const runtime = useRuntimeConfig()
  return String(runtime.public?.fireux?.id || '').trim() || 'unknown-app'
}

async function optionalUploadUser(event: H3Event) {
  const token = bearerTokenFromEvent(event)
  if (!token) return null

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
  return {
    uid: String(decoded.uid || '').trim(),
  }
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST'],
  })

  const appId = currentAppId()
  const user = await optionalUploadUser(event)
  const createdBy = user?.uid || 'anonymous'
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
  const menuRef = db.collection(MenuStorage.rootCollection).doc(slug)
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

  await serverCreate(FIRESTORE_MUTATION_TARGETS.menus, slug, {
    id: slug,
    slug,
    kind: 'doc',
    file_kind: documentKindFromFile({
      fileName: file.fileName,
      contentType: file.contentType,
    }),
    source_app_id: appId,
    created_by: createdBy,
    name: menuNameFromSlug(slug),
    status: 'published',
    file: {
      url: saved.fileUrl,
      name: file.fileName,
      type: file.contentType,
      storage_path: objectPath,
    },
    created: serverAuditStamp({ by: createdBy, appId }),
    updated: serverAuditStamp({ by: createdBy, appId }),
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
    storage_owner: appId,
    powered_by: {
      name: 'Go QR',
      url: 'https://go-qr.web.app',
      logo_url: 'https://go-qr.web.app/img/app/logo.svg',
    },
  }
})
