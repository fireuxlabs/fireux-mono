import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

export type MenuDocument = {
  id: string
  slug: string
  name: string
  description: string
  status: string
  service_modes: string[]
  sort_order: number
  design: {
    color_mode: string
  }
  title: string
  source_type: string
  doc_url?: string
  doc_type?: string
  doc_name?: string
  doc_storage_path?: string
  file_url?: string
  file_type?: string
  file_name?: string
  storage_path?: string
  storage_owner: string
  source_app: string
  display_label: string
  qr_centre_label: string
  is_public: boolean
  created?: unknown
  updated?: unknown
  created_at?: unknown
  updated_at?: unknown
}

export const menuCollectionName = 'menus'
export const reservedMenuQrSlugs = [
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
  'menus',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

export function miseboxPublicBaseUrl() {
  const runtime = useRuntimeConfig()
  const fireux = (runtime.public?.fireux || {}) as Record<string, unknown>

  return String(
    process.env.MISEBOX_PUBLIC_URL ||
      fireux.siteUrl ||
      'https://misebox.app'
  ).replace(/\/+$/, '')
}

export function menuQrPublicBaseUrl() {
  return `${miseboxPublicBaseUrl()}/menus`
}

export function normalizeMenuQrSlug(value: unknown) {
  return normalizeSlug(value)
}

export function validateMenuQrSlug(slug: string) {
  return validatePublicSlug(slug, {
    label: 'Menu path',
    reservedScope: 'root',
    reserved: reservedMenuQrSlugs,
  })
}

export function menuQrDb() {
  return getRuntimeFirestore()
}

export function menuDocumentRef(slug: string) {
  return menuQrDb().collection(menuCollectionName).doc(slug)
}

export async function readMenuDocument(slug: string) {
  const id = normalizeMenuQrSlug(slug)
  const validation = validateMenuQrSlug(id)
  if (!validation.isValid) return null

  const snap = await menuDocumentRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as MenuDocument
}

export function menuQrPublicUrl(slug: string) {
  return `${menuQrPublicBaseUrl()}/${encodeURIComponent(slug)}`
}

export function menuQrQrUrl(slug: string) {
  return `${menuQrPublicUrl(slug)}/qr`
}

export function serializeMenuDocument(record: MenuDocument) {
  const docUrl = record.doc_url || record.file_url || ''
  const docType = record.doc_type || record.file_type || ''
  const docName = record.doc_name || record.file_name || ''

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    status: record.status,
    source_type: record.source_type,
    title: record.title,
    doc_url: docUrl,
    doc_type: docType,
    doc_name: docName,
    file_url: docUrl,
    file_type: docType,
    file_name: docName,
    storage_owner: record.storage_owner,
    source_app: record.source_app,
    display_label: record.display_label,
    qr_centre_label: record.qr_centre_label,
    is_public: record.is_public,
    public_url: menuQrPublicUrl(record.slug),
    qr_url: menuQrQrUrl(record.slug),
  }
}

export async function createMenuDocument(input: {
  slug: string
  docUrl: string
  docType: string
  docName: string
  docStoragePath: string
}) {
  const record = {
    created: {
      at: FieldValue.serverTimestamp(),
      by: 'anonymous',
      app_id: 'misebox',
    },
    updated: {
      at: FieldValue.serverTimestamp(),
      by: 'anonymous',
    },
    id: input.slug,
    slug: input.slug,
    name: input.slug,
    description: '',
    status: 'published',
    service_modes: ['dine_in'],
    sort_order: 0,
    design: {
      color_mode: 'light',
    },
    title: input.slug,
    source_type: 'storage_file',
    doc_url: input.docUrl,
    doc_type: input.docType,
    doc_name: input.docName,
    doc_storage_path: input.docStoragePath,
    storage_owner: 'misebox',
    source_app: 'misebox',
    display_label: 'QR Menu',
    qr_centre_label: 'Menu',
    is_public: true,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }

  await menuDocumentRef(input.slug).create(record)

  return {
    ...record,
    id: input.slug,
  } as MenuDocument
}
