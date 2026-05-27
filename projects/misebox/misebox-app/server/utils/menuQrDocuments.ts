import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

export type MenuQrDocument = {
  id: string
  slug: string
  title: string
  file_url: string
  file_type: string
  file_name: string
  storage_path: string
  storage_owner: string
  source_app: string
  display_label: string
  qr_centre_label: string
  is_public: boolean
  created_at?: unknown
  updated_at?: unknown
}

export const menuQrCollectionName = 'menu_qr_documents'
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
    label: 'Menu URL',
    reservedScope: 'root',
    reserved: reservedMenuQrSlugs,
  })
}

export function menuQrDb() {
  return getRuntimeFirestore()
}

export function menuQrDocumentRef(slug: string) {
  return menuQrDb().collection(menuQrCollectionName).doc(slug)
}

export async function readMenuQrDocument(slug: string) {
  const id = normalizeMenuQrSlug(slug)
  const validation = validateMenuQrSlug(id)
  if (!validation.isValid) return null

  const snap = await menuQrDocumentRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as MenuQrDocument
}

export function menuQrPublicUrl(slug: string) {
  return `${menuQrPublicBaseUrl()}/${encodeURIComponent(slug)}`
}

export function menuQrQrUrl(slug: string) {
  return `${menuQrPublicUrl(slug)}/qr`
}

export function serializeMenuQrDocument(record: MenuQrDocument) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    file_url: record.file_url,
    file_type: record.file_type,
    file_name: record.file_name,
    storage_owner: record.storage_owner,
    source_app: record.source_app,
    display_label: record.display_label,
    qr_centre_label: record.qr_centre_label,
    is_public: record.is_public,
    public_url: menuQrPublicUrl(record.slug),
    qr_url: menuQrQrUrl(record.slug),
  }
}

export async function createMenuQrDocument(input: {
  slug: string
  fileUrl: string
  fileType: string
  fileName: string
  storagePath: string
}) {
  const record = {
    id: input.slug,
    slug: input.slug,
    title: input.slug,
    file_url: input.fileUrl,
    file_type: input.fileType,
    file_name: input.fileName,
    storage_path: input.storagePath,
    storage_owner: 'misebox',
    source_app: 'misebox',
    display_label: 'Food Menu',
    qr_centre_label: 'Menu',
    is_public: true,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }

  await menuQrDocumentRef(input.slug).create(record)

  return {
    id: input.slug,
    ...record,
  } as MenuQrDocument
}
