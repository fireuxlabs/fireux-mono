import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

const allowed = new Set(['serving-carton'])

export default defineEventHandler(async (event) => {
  const assetId = String(getRouterParam(event, 'assetId') ?? '').trim()
  if (!allowed.has(assetId)) {
    throw createError({ statusCode: 404, statusMessage: 'Brand Asset not found.' })
  }

  const snapshot = await getRuntimeFirestore()
    .doc(`apps/friiites/brand-assets/${assetId}`)
    .get()
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Brand Asset not found.' })
  }
  const data = snapshot.data() ?? {}
  setResponseHeaders(event, { 'Cache-Control': 'private, no-store' })
  return {
    id: assetId,
    role: String(data.role ?? ''),
    name: String(data.name ?? ''),
    status: String(data.status ?? ''),
    media: {
      url: String((data.media as any)?.url ?? ''),
      object_path: String((data.media as any)?.object_path ?? ''),
      content_type: String((data.media as any)?.content_type ?? ''),
      width: Number((data.media as any)?.width ?? 0),
      height: Number((data.media as any)?.height ?? 0),
      has_alpha: (data.media as any)?.has_alpha === true,
    },
  }
})
