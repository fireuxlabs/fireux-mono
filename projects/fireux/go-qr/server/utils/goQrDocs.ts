import { useRuntimeConfig } from '#imports'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'

export type GoQrDocRecord = {
  id: string
  slug: string
  title?: string
  file_url: string
  file_name: string
  file_type: string
  storage_path?: string
  display_label?: string
  qr_centre_label?: string
  created?: unknown
  updated?: unknown
}

export const reservedGoQrDocSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'workspace',
  'dashboard',
  'docs',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

export function normalizeGoQrDocSlug(value: unknown) {
  return normalizeSlug(value)
}

export function validateGoQrDocSlug(slug: string) {
  return validatePublicSlug(slug, {
    label: 'Doc path',
    reservedScope: 'root',
    reserved: reservedGoQrDocSlugs,
  })
}

export function goQrPublicBaseUrl() {
  const runtime = useRuntimeConfig()
  const fireux = (runtime.public?.fireux || {}) as Record<string, unknown>

  return String(fireux.siteUrl || 'https://go-qr.web.app').replace(/\/+$/, '')
}

export function goQrDocBaseUrl() {
  return `${goQrPublicBaseUrl()}/doc`
}

export function goQrDocUrl(slug: string) {
  return `${goQrDocBaseUrl()}/${encodeURIComponent(slug)}`
}

export function goQrDocQrUrl(slug: string) {
  return `${goQrDocUrl(slug)}/qr`
}

export function goQrDocRef(slug: string) {
  return getRuntimeFirestore().collection('docs').doc(slug)
}

export async function readGoQrDocRecord(slug: string) {
  const id = normalizeGoQrDocSlug(slug)
  const validation = validateGoQrDocSlug(id)
  if (!validation.isValid) return null

  const snap = await goQrDocRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as GoQrDocRecord
}

export function serializeGoQrDocRecord(record: GoQrDocRecord) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title || record.display_label || record.slug,
    file_url: record.file_url,
    file_name: record.file_name,
    file_type: record.file_type,
    storage_path: record.storage_path || '',
    display_label: record.display_label || record.title || record.slug,
    qr_centre_label: record.qr_centre_label || 'Q',
    public_url: goQrDocUrl(record.slug),
    qr_url: goQrDocQrUrl(record.slug),
  }
}
