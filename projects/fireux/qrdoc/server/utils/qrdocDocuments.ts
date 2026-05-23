import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { createError } from 'h3'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

export type QrdocDocumentRecord = {
  id: string
  title: string
  slug: string
  file_url: string
  file_type: string
  file_name: string
  storage_path: string
  owner_id: string
  is_public: boolean
  created_at?: unknown
  updated_at?: unknown
}

const collectionName = 'qrdoc_documents'

export function normalizeDocumentId(value: unknown) {
  return String(value || '').trim()
}

export function assertDocumentId(id: string) {
  if (!id || id.includes('/') || id === '.' || id === '..') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document id is not valid',
    })
  }
}

export function qrdocDb() {
  return getRuntimeFirestore('qrdoc')
}

export function qrdocDocumentRef(id: string) {
  return qrdocDb().collection(collectionName).doc(id)
}

export async function readQrdocDocument(id: string) {
  assertDocumentId(id)
  const snap = await qrdocDocumentRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as QrdocDocumentRecord
}

export function serializeQrdocDocument(record: QrdocDocumentRecord) {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    file_url: record.file_url,
    file_type: record.file_type,
    file_name: record.file_name,
    owner_id: record.owner_id,
    is_public: record.is_public,
  }
}

export async function listQrdocDocuments(limit = 50) {
  const snap = await qrdocDb()
    .collection(collectionName)
    .where('is_public', '==', true)
    .limit(limit)
    .get()

  return snap.docs
    .map((doc) => serializeQrdocDocument({
      id: doc.id,
      ...doc.data(),
    } as QrdocDocumentRecord))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

export function qrdocStorageBucket() {
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

export function createQrdocDocumentRecord(input: {
  slug: string
  fileName: string
  fileType: string
  storagePath: string
}): Omit<QrdocDocumentRecord, 'created_at' | 'updated_at'> & {
  created_at: FieldValue
  updated_at: FieldValue
} {
  return {
    id: input.slug,
    title: input.slug,
    slug: input.slug,
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
