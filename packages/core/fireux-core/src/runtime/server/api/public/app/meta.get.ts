import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import type { FireuxMetaContent } from '../../../../models/system/meta-content.model'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isFireuxMetaContent(value: unknown): value is FireuxMetaContent {
  if (!isRecord(value)) return false

  const app = value.app
  return (
    isRecord(app) &&
    typeof app.id === 'string' &&
    typeof app.name === 'string' &&
    typeof app.ecosystem === 'string'
  )
}

export default defineEventHandler((event: H3Event) => {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig()
  const meta = runtimeConfig.fireux?.meta

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  if (!isFireuxMetaContent(meta)) {
    throw createError({
      statusCode: 404,
      statusMessage: `[app/meta] App meta is not configured for "${cfg.appId}"`,
    })
  }

  return {
    ok: true,
    app: {
      id: cfg.appId,
      name: cfg.appName,
      shortName: cfg.appShortName,
      ecosystem: cfg.ecosystem,
      role: cfg.role,
      modules: cfg.modules,
      logo: cfg.appLogo || cfg.appThumbnail,
      appThumbnail: cfg.appThumbnail,
    },
    meta,
    endpoints: {
      info: '/api/public/app/info',
      meta: '/api/public/app/meta',
    },
    now: new Date().toISOString(),
  }
})
