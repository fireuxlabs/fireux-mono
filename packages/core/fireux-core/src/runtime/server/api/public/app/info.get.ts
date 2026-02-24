import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

type PackageInfo = {
  name?: string
  version?: string
}

function readPackageInfo(): PackageInfo {
  try {
    const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    const parsed = JSON.parse(raw) as { name?: unknown; version?: unknown }
    return {
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      version: typeof parsed.version === 'string' ? parsed.version : undefined,
    }
  } catch {
    return {}
  }
}

export default defineEventHandler((event: H3Event) => {
  const cfg = useFireUXConfig()
  const pkg = readPackageInfo()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

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
    package: pkg,
    endpoints: {
      info: '/api/public/app/info',
      envCheck: '/api/internal/app/env-check',
    },
    now: new Date().toISOString(),
  }
})
