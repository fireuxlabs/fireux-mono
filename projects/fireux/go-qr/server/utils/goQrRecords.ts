import { useRuntimeConfig } from '#imports'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { createError, getHeader, type H3Event } from 'h3'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { goQrBrand } from './goQrBrand'

export type GoQrRecord = {
  id: string
  title: string
  slug: string
  type: string
  file_url: string
  file_type: string
  file_name: string
  storage_path: string
  storage_owner?: string
  source_app?: string
  display_label?: string
  qr_centre_label?: string
  owner_id: string
  is_public: boolean
  created_at?: unknown
  updated_at?: unknown
}

export const goQrCollectionName = 'documents'
export const maxGoQrFileSizeMb = 10
export const maxGoQrFileSizeBytes = maxGoQrFileSizeMb * 1024 * 1024
const appId = 'go-qr'
export const reservedGoQrDocumentIds = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

export function normalizeDocumentId(value: unknown) {
  return normalizeSlug(value)
}

export function assertDocumentId(id: string) {
  const result = validatePublicSlug(id, {
    label: 'Document path',
    reservedScope: 'root',
    reserved: reservedGoQrDocumentIds,
  })

  if (!result.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: result.message || 'Document path is not valid',
    })
  }
}

export function normalizeDocumentType(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function assertDocumentType(type: string) {
  if (type !== 'doc' && type !== 'food-menu') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document type is not valid',
    })
  }
}

export function goQrDb() {
  return getRuntimeFirestore('go-qr')
}

export function goQrRecordRef(id: string) {
  return goQrDb().collection(goQrCollectionName).doc(id)
}

export async function readGoQrRecord(id: string) {
  assertDocumentId(id)
  const snap = await goQrRecordRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as GoQrRecord
}

function bearerTokenFromRequest(event: H3Event) {
  const authorization = String(getHeader(event, 'authorization') || '').trim()
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || ''
}

export async function assertGoQrAdmin(event: H3Event) {
  const token = bearerTokenFromRequest(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
  const uid = String(decoded.uid || '').trim()
  if (!uid) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const snap = await goQrDb().doc(`apps/${appId}/users/${uid}`).get()
  if (snap.get('role') !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin required' })
  }

  return { uid }
}

export async function deleteGoQrRecord(id: string) {
  assertDocumentId(id)

  const docRef = goQrRecordRef(id)
  const snap = await docRef.get()
  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Go QR document not found',
    })
  }

  const record = { id: snap.id, ...snap.data() } as GoQrRecord
  if (record.storage_path) {
    await goQrStorageBucket()
      .file(record.storage_path)
      .delete({ ignoreNotFound: true })
  }

  await docRef.delete()
  return record
}

export function serializeGoQrRecord(record: GoQrRecord) {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    type: record.type,
    file_url: record.file_url,
    file_type: record.file_type,
    file_name: record.file_name,
    storage_owner: record.storage_owner || 'go-qr',
    source_app: record.source_app || '',
    display_label: record.display_label || '',
    qr_centre_label: record.qr_centre_label || '',
    owner_id: record.owner_id,
    is_public: record.is_public,
  }
}

export async function listGoQrRecords(limit = 50) {
  const snap = await goQrDb()
    .collection(goQrCollectionName)
    .where('is_public', '==', true)
    .limit(limit)
    .get()

  return snap.docs
    .map((doc) => serializeGoQrRecord({
      id: doc.id,
      ...doc.data(),
    } as GoQrRecord))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

export function goQrStorageBucket() {
  const runtime = useRuntimeConfig()
  const configuredBucket = String(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket || ''
  ).trim()

  return configuredBucket
    ? getStorage(getAdminApp()).bucket(configuredBucket)
    : getStorage(getAdminApp()).bucket()
}

export function safeStorageFileName(value: unknown) {
  return String(value || 'document')
    .trim()
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'document'
}

export function publicFileUrl(slug: string) {
  return `/api/docs/${encodeURIComponent(slug)}/file`
}

export function createGoQrRecord(input: {
  slug: string
  type: string
  fileName: string
  fileType: string
  storagePath: string
  fileUrl?: string
  storageOwner?: string
  sourceApp?: string
  displayLabel?: string
  qrCentreLabel?: string
}): Omit<GoQrRecord, 'created_at' | 'updated_at'> & {
  created_at: FieldValue
  updated_at: FieldValue
} {
  return {
    id: input.slug,
    title: input.slug,
    slug: input.slug,
    type: input.type,
    file_url: input.fileUrl || publicFileUrl(input.slug),
    file_type: input.fileType,
    file_name: input.fileName,
    storage_path: input.storagePath,
    storage_owner: input.storageOwner || 'go-qr',
    source_app: input.sourceApp || '',
    display_label: input.displayLabel || '',
    qr_centre_label: input.qrCentreLabel || '',
    owner_id: 'anonymous',
    is_public: true,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }
}

type MultipartPart = {
  name?: string
  filename?: string
  type?: string
  data?: Buffer
}

function multipartFieldValue(parts: MultipartPart[] | undefined, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

function normalizeDisplayText(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function normalizeExternalFileUrl(value: unknown) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}

export async function createGoQrDocumentFromMultipart(
  parts: MultipartPart[] | undefined,
  options: {
    type?: 'doc' | 'food-menu'
  } = {}
) {
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeDocumentId(multipartFieldValue(parts, 'slug'))
  const type = options.type || normalizeDocumentType(multipartFieldValue(parts, 'type'))
  const externalFileUrl = normalizeExternalFileUrl(multipartFieldValue(parts, 'external_file_url'))
  const externalFileType = normalizeDisplayText(multipartFieldValue(parts, 'external_file_type'), 120)
  const externalFileName = normalizeDisplayText(multipartFieldValue(parts, 'external_file_name'), 160)
  const storageOwner = normalizeDisplayText(multipartFieldValue(parts, 'storage_owner'), 40)
  const sourceApp = normalizeDisplayText(multipartFieldValue(parts, 'source_app'), 80)
  const displayLabel = normalizeDisplayText(multipartFieldValue(parts, 'display_label'), 48)
  const qrCentreLabel = normalizeDisplayText(multipartFieldValue(parts, 'qr_centre_label'), 16)

  assertDocumentId(slug)
  assertDocumentType(type)

  if (!filePart?.data?.length && !externalFileUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document file is required',
    })
  }

  if (filePart?.data?.byteLength && filePart.data.byteLength > maxGoQrFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxGoQrFileSizeMb} MB`,
    })
  }

  const docRef = goQrRecordRef(slug)
  const existing = await docRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Document path is already taken',
    })
  }

  let fileName = safeStorageFileName(externalFileName || filePart?.filename || slug)
  let fileType = String(externalFileType || filePart?.type || 'application/octet-stream').trim()
  let storagePath = ''
  let fileUrl = externalFileUrl

  if (filePart?.data?.length) {
    fileName = safeStorageFileName(filePart.filename)
    fileType = String(filePart.type || 'application/octet-stream').trim()
    storagePath = `go-qr/documents/${slug}/raw/${fileName}`
    fileUrl = ''

    await goQrStorageBucket().file(storagePath).save(filePart.data, {
      contentType: fileType,
      resumable: false,
      metadata: {
        cacheControl: 'public, max-age=300',
      },
    })
  }

  const record = createGoQrRecord({
    slug,
    type,
    fileName,
    fileType,
    storagePath,
    fileUrl,
    storageOwner: storageOwner || (externalFileUrl ? 'consumer' : 'go-qr'),
    sourceApp,
    displayLabel,
    qrCentreLabel,
  })

  await docRef.create(record)

  return {
    ok: true,
    slug,
    path: `/${encodeURIComponent(slug)}`,
    qr_path: `/${encodeURIComponent(slug)}/qr`,
    powered_by: goQrBrand,
  }
}
