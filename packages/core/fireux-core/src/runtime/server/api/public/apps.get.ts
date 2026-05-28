import { createError, defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../models/core/app.model'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNonNegativeInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0
}

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const ecosystem = String(cfg.ecosystem || '').trim()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  if (!ecosystem) {
    throw createError({
      statusCode: 400,
      statusMessage: '[apps] Missing ecosystem in FireUX runtime config',
    })
  }

  const db = getRuntimeFirestore()
  const snap = await db.collection(AppStorage.collection).where('ecosystem', '==', ecosystem).get()

  const apps = snap.docs
    .filter((doc) => asString(doc.data()?.status) !== 'retired')
    .map((doc) => {
      const data = (doc.data() || {}) as Record<string, unknown>
      const media = asRecord(data.media)
      const derived = asRecord(data.derived)

      return {
        id: typeof data.id === 'string' && data.id.trim() ? data.id : doc.id,
        app_name: asString(data.app_name),
        app_short_name: asString(data.app_short_name),
        ecosystem: asString(data.ecosystem),
        role: asString(data.role),
        tagline: asString(data.tagline),
        derived: {
          user_count: asNonNegativeInt(derived.user_count),
        },
        media: {
          logo_url: asString(media.logo_url),
          thumbnail_url: asString(media.thumbnail_url),
          wordmark_light_url: asString(media.wordmark_light_url),
          wordmark_dark_url: asString(media.wordmark_dark_url),
        },
      }
    })
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')))

  return {
    ok: true,
    ecosystem,
    count: apps.length,
    now: new Date().toISOString(),
    apps,
  }
})
