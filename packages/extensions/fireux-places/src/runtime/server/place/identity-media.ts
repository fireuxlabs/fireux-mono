import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { requireFirebaseStorageDownloadUrl } from 'fireux-core/runtime/server/utils/uploads/storage'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function normalizePlaceIdentityPatch(
  value: unknown,
  target: { bucketName: string; placeId: string }
) {
  const source = record(value)
  const allowed = new Set(['logo_image_url', 'wordmark_image_url'])
  const unsupported = Object.keys(source).filter(key => !allowed.has(key))
  if (unsupported.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported Place identity field: ${unsupported[0]}.`,
    })
  }

  const result: Record<string, unknown> = {}
  for (const key of allowed) {
    const candidate = text(source[key])
    if (!candidate) continue
    result[key] = requireFirebaseStorageDownloadUrl(candidate, {
      bucketName: target.bucketName,
      objectPath: `places/${target.placeId}/identity/${key === 'logo_image_url' ? 'logo' : 'wordmark'}`,
      label: key === 'logo_image_url' ? 'Place logo' : 'Place wordmark',
    })
  }
  return Object.keys(result).length ? result : FieldValue.delete()
}
