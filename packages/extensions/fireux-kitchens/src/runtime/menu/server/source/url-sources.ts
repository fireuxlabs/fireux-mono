import { createError, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { requireMenuName, text } from './uploads'

export type KitchenMenuUrlSourceRequest = {
  appId: string
  kitchenId: string
  uploadId: string
  replaceExisting: boolean
  sourceUrl: string
  sourceProvider: string
}

function normalizedUrl(value: unknown, label: string) {
  const raw = text(value)

  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported protocol')
    }

    return url.toString()
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} must be a valid http or https URL.`,
    })
  }
}

function providerFromUrl(sourceUrl: string, value: unknown) {
  const explicit = normalizeSlug(value)
  if (explicit) return explicit

  return new URL(sourceUrl).hostname.toLowerCase() || 'url'
}

export async function readKitchenMenuUrlSourceRequest(
  event: H3Event
): Promise<KitchenMenuUrlSourceRequest> {
  const body = await readBody<Record<string, unknown>>(event)
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const uploadId = normalizeSlug(body?.uploadId || body?.menuId || body?.slug)
  const sourceUrl = normalizedUrl(body?.sourceUrl || body?.url, 'Menu URL')

  requireMenuName(uploadId)

  return {
    appId,
    kitchenId,
    uploadId,
    sourceUrl,
    sourceProvider: providerFromUrl(sourceUrl, body?.sourceProvider),
    replaceExisting:
      text(body?.replaceExisting) === 'true' ||
      text(body?.replace) === '1' ||
      text(body?.replace) === 'true',
  }
}

export function kitchenMenuUrlSourceRecord(
  request: KitchenMenuUrlSourceRequest,
  uid: string
) {
  return {
    id: request.uploadId,
    kitchen_id: request.kitchenId,
    app_id: request.appId,
    provider: request.sourceProvider,
    tool: 'url',
    storage_owner: 'external',
    storage_app_id: request.appId,
    source_url: request.sourceUrl,
    source_provider: request.sourceProvider,
    file_url: '',
    file_name: '',
    file_type: '',
    file_kind: 'url',
    storage_path: '',
    files: [],
    files_count: 0,
    status: 'uploaded',
    created: serverAuditStamp({ by: uid, appId: request.appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}
