import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { goQrBrand } from './goQrBrand'
import { goQrProviderBaseUrl } from './goQrToolContracts'

export type GoQrTextRecord = {
  id: string
  title: string
  slug: string
  text: string
  display_label?: string
  qr_centre_label?: string
  owner_id: string
  is_public: boolean
  created_at?: unknown
  updated_at?: unknown
}

export const goQrTextCollectionName = 'text'
export const maxGoQrTextLength = 600
export const reservedGoQrTextIds = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'doc',
  'docs',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

export function normalizeTextQrId(value: unknown) {
  return normalizeSlug(value)
}

export function goQrTextDb() {
  return getRuntimeFirestore('go-qr')
}

export function goQrTextRecordRef(id: string) {
  return goQrTextDb().collection(goQrTextCollectionName).doc(id)
}

export function assertTextQrId(id: string) {
  const result = validatePublicSlug(id, {
    label: 'Text path',
    reservedScope: 'entity',
    reserved: reservedGoQrTextIds,
  })

  if (!result.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: result.message || 'Text path is not valid',
    })
  }
}

function normalizeText(value: unknown) {
  return String(value || '').trim().slice(0, maxGoQrTextLength)
}

function normalizeDisplayText(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export async function textQrAvailability(id: string) {
  return await checkPublicSlugAvailability(id, {
    label: 'Text path',
    reservedScope: 'entity',
    reserved: reservedGoQrTextIds,
    takenMessage: 'This text path is already taken.',
    exists: async (slug) => {
      const snap = await goQrTextRecordRef(slug).get()
      return snap.exists
    },
  })
}

export async function readGoQrTextRecord(id: string) {
  assertTextQrId(id)
  const snap = await goQrTextRecordRef(id).get()
  if (!snap.exists) return null

  return {
    id: snap.id,
    ...snap.data(),
  } as GoQrTextRecord
}

export function serializeGoQrTextRecord(record: GoQrTextRecord) {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    text: record.text,
    display_label: record.display_label || '',
    qr_centre_label: record.qr_centre_label || '',
    owner_id: record.owner_id,
    is_public: record.is_public,
  }
}

export async function createGoQrTextRecord(input: {
  slug: unknown
  text: unknown
  displayLabel?: unknown
  qrCentreLabel?: unknown
}) {
  const slug = normalizeTextQrId(input.slug)
  const text = normalizeText(input.text)
  const displayLabel = normalizeDisplayText(input.displayLabel || slug, 48)
  const qrCentreLabel = normalizeDisplayText(input.qrCentreLabel || 'Q', 16)

  assertTextQrId(slug)

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text is required',
    })
  }

  const existing = await goQrTextRecordRef(slug).get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This text path is already taken.',
    })
  }

  const record: GoQrTextRecord = {
    id: slug,
    title: displayLabel || slug,
    slug,
    text,
    display_label: displayLabel,
    qr_centre_label: qrCentreLabel,
    owner_id: 'anonymous',
    is_public: true,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  }

  await goQrTextRecordRef(slug).create(record)

  const baseUrl = goQrProviderBaseUrl()
  const path = `/text/${encodeURIComponent(slug)}`
  const qrPath = `${path}/qr`

  return {
    ok: true,
    slug,
    path,
    qr_path: qrPath,
    url: `${baseUrl}${path}`,
    qr_url: `${baseUrl}${qrPath}`,
    powered_by: goQrBrand,
  }
}
