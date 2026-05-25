import { useRuntimeConfig } from '#imports'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { createError, getHeader, type H3Event } from 'h3'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

export type GoQrRecord = {
  id: string
  title: string
  slug: string
  type: string
  file_url: string
  file_type: string
  file_name: string
  storage_path: string
  owner_id: string
  is_public: boolean
  created_at?: unknown
  updated_at?: unknown
}

const collectionName = 'go_qr_documents'
const appId = 'go-qr'
const reservedDocumentIds = [
  'about',
  'blog',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'terms',
]

export function normalizeDocumentId(value: unknown) {
  return normalizeSlug(value)
}

export function assertDocumentId(id: string) {
  const result = validatePublicSlug(id, {
    label: 'Document path',
    reservedScope: 'root',
    reserved: reservedDocumentIds,
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
  return goQrDb().collection(collectionName).doc(id)
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
    owner_id: record.owner_id,
    is_public: record.is_public,
  }
}

export async function listGoQrRecords(limit = 50) {
  const snap = await goQrDb()
    .collection(collectionName)
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
}): Omit<GoQrRecord, 'created_at' | 'updated_at'> & {
  created_at: FieldValue
  updated_at: FieldValue
} {
  return {
    id: input.slug,
    title: input.slug,
    slug: input.slug,
    type: input.type,
    file_url: publicFileUrl(input.slug),
    file_type: input.fileType,
    file_name: input.fileName,
    storage_path: input.storagePath,
    owner_id: 'anonymous',
    is_public: true,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }
}
