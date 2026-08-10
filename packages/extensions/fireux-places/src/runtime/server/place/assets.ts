import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import { requireFirebaseStorageDownloadUrl } from 'fireux-core/runtime/server/utils/uploads/storage'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const assetRoles = new Set([
  'image',
  'cover',
  'gallery',
  'logo',
  'wordmark',
  'backdrop_color',
])

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function imageAsset(
  value: unknown,
  target: { bucketName: string; placeId: string },
  role: 'image' | 'cover' | 'logo' | 'wordmark'
) {
  const candidate = text(value)
  if (!candidate) return FieldValue.delete()
  if (candidate.length > 2_048) badRequest(`Place ${role} URL is too long.`)
  return requireFirebaseStorageDownloadUrl(candidate, {
    bucketName: target.bucketName,
    objectPath: `places/${target.placeId}/${role}`,
    label: `Place ${role}`,
  })
}

function galleryAsset(
  value: unknown,
  target: { bucketName: string; placeId: string }
) {
  if (value === null || value === undefined) return FieldValue.delete()
  if (!Array.isArray(value)) badRequest('Place gallery must be a list.')

  const images = Array.from(new Set(value.map(text).filter(Boolean)))
  if (images.length > 24) badRequest('Place gallery is limited to 24 images.')
  if (images.some(image => image.length > 2_048)) {
    badRequest('A Place gallery URL is too long.')
  }
  return images.length
    ? images.map(image => requireFirebaseStorageDownloadUrl(image, {
        bucketName: target.bucketName,
        objectPrefix: `places/${target.placeId}/gallery/`,
        label: 'Place gallery image',
      }))
    : FieldValue.delete()
}

export function normalizePlaceAssetsPatch(
  value: unknown,
  target: { bucketName: string; placeId: string }
) {
  const source = record(value)
  const keys = Object.keys(source)
  if (!keys.length) badRequest('Place assets patch is required.')
  const unsupported = keys.find(key => !assetRoles.has(key))
  if (unsupported) badRequest(`Unsupported Place asset: ${unsupported}.`)

  const patch: Record<string, unknown> = {}
  for (const [role, candidate] of Object.entries(source)) {
    if (role === 'gallery') {
      patch['assets.gallery'] = galleryAsset(candidate, target)
    } else if (role === 'backdrop_color') {
      const color = normalizeHexColor(candidate)
      if (color === null) badRequest('Place backdrop colour must be a 6-digit hex colour.')
      patch['assets.backdrop_color'] = color || FieldValue.delete()
    } else {
      patch[`assets.${role}`] = imageAsset(
        candidate,
        target,
        role as 'image' | 'cover' | 'logo' | 'wordmark'
      )
    }
  }
  return patch
}
