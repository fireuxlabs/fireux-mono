// FILE: packages/core/fireux-core/config/app/fireux.config.ts
import type { NuxtConfig } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'

import { configNitroFirebase } from './nitro'
import { configPwa } from './pwa'
import { setRuntime, type RuntimeAppRole } from './runtime'
import type { FireuxSeoConfig } from './seo'
import { configViteWorkspace } from './vite'
import { resolveFireuxBrandAssets } from '../../utils/brandAssets'
import type { FireuxMetaContent } from '../../runtime/models/system/meta-content.model'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    pwa?: Record<string, any>
    icon?: Record<string, any>
  }
  interface NuxtOptions {
    pwa?: Record<string, any>
    icon?: Record<string, any>
  }
}

export type FireuxAppConfig = {
  ecosystem: string
  id: string
  name: string
  shortName: string
  /** Optional app-owned Firestore database id. Standalone apps should set this. */
  databaseId?: string
  /** Optional app thumbnail path/URL (role-aware defaults apply when omitted). */
  appThumbnail?: string
  /** Optional app logo path/URL (preferred). Role-aware defaults apply when omitted. */
  appLogo?: string
  /** Optional public contact/support email shown in shared UI (e.g. footer). */
  contactEmail?: string
  role: RuntimeAppRole
  modules?: NonNullable<NuxtConfig['modules']>
  consoles?: string[]
  seo?: FireuxSeoConfig
  meta?: FireuxMetaContent
}

function moduleName(entry: unknown): string | undefined {
  if (typeof entry === 'string') return entry
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0]
  return undefined
}

function isValidJsIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

function toValidJsIdentifier(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'server'
  if (isValidJsIdentifier(trimmed)) return trimmed

  const parts = trimmed
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean)

  let out = parts
    .map((p, i) => {
      const lower = p.toLowerCase()
      if (i === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')

  if (!out) out = 'server'
  if (!/^[A-Za-z_$]/.test(out)) out = `_${out}`
  out = out.replace(/[^A-Za-z0-9_$]/g, '_')

  return out
}

function defaultNitroFirebaseRegion(ecosystem: string): string {
  switch (ecosystem) {
    case 'misebox':
      return 'europe-west6'
    default:
      // FireUX + Cleanbox use Firestore multi-region eur3; eur3 is not a
      // deployable Cloud Functions region, so we default to a nearby region.
      return 'europe-west1'
  }
}

function reqEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== 'string' || !value.trim()) {
    const isCi =
      process.env.CI === 'true' ||
      process.env.CI === '1' ||
      process.env.GITHUB_ACTIONS === 'true'
    const isTypecheck = process.argv.some((arg) => arg.includes('typecheck'))

    // During CI (especially on `pnpm install` → `postinstall` → `nuxi prepare`),
    // we don't require full runtime envs yet.
    if (isCi || isTypecheck) {
      if (name === 'APP_DOMAIN') return 'localhost'
      if (name === 'NUXT_FIREBASE_APP_ID') return 'ci'
    }

    throw new Error(`[fireux] Missing required env var: ${name}`)
  }
  return value.trim()
}

function optEnv(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function validateFireuxAppConfig(app: FireuxAppConfig): void {
  if (app.role === 'standalone' && app.ecosystem !== 'fireux') {
    throw new Error(
      '[fireux] role "standalone" is currently only supported inside the "fireux" ecosystem.'
    )
  }
}

function createAppDatabaseRuntimeModule(databaseId?: string) {
  const resolvedDatabaseId = typeof databaseId === 'string' ? databaseId.trim() : ''
  if (!resolvedDatabaseId) return null

  return defineNuxtModule({
    meta: {
      name: 'fireux-app-database-runtime',
    },
    setup(_options, nuxt) {
      const runtime = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const pub = ((runtime.public ||= {}) as Record<string, any>)
      const ecosystem = ((pub.firebaseEcosystem ||= {}) as Record<string, any>)
      const firebase = ((ecosystem.firebase ||= {}) as Record<string, any>)
      firebase.databaseId = resolvedDatabaseId
    },
  })
}

export function defineFireuxConfig(app: FireuxAppConfig): NuxtConfig {
  validateFireuxAppConfig(app)

  const nuxt: NuxtConfig = {}
  const appDatabaseRuntimeModule = createAppDatabaseRuntimeModule(app.databaseId)
  const brandAssets = resolveFireuxBrandAssets({
    role: app.role,
    appLogo: app.appLogo,
    appThumbnail: app.appThumbnail,
  })

  // Ensure responsive breakpoints behave correctly on mobile.
  // Without an explicit viewport meta tag, browsers may render using a
  // desktop-sized viewport (making the console sidebar appear "always on").
  const head: any = ((nuxt as any).app ||= {}).head ||= {}
  const meta: any[] = (head.meta ||= [])
  const hasViewport = meta.some((m) => m?.name === 'viewport')
  if (!hasViewport) {
    meta.push({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
  }

  // Align Nitro defaults with our current baseline.
  // Prevents runtime fallback warnings during dev.
  ;(nuxt as any).compatibilityDate = '2025-12-22'
  const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
  nuxtWithNitro.nitro = {
    ...(nuxtWithNitro.nitro || {}),
    compatibilityDate: '2025-12-22',
  }
  nuxt.experimental = {
    ...(nuxt.experimental || {}),
    // Avoid stale dev client requests to /_nuxt/builds/meta/dev.json.
    appManifest: process.env.NODE_ENV === 'production',
    // Enables compile-time route meta extraction from definePageMeta.
    scanPageMeta: true,
  }

  nuxt.srcDir = 'app'
  // Keep one generated output location for both `nuxi prepare` and `nuxi dev`.
  // We keep it under /app so project-app guards do not delete the live dev
  // output at the repo root during save/push flows.
  nuxt.buildDir = 'app/.nuxt'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  nuxt.modules = [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/icon',
    `fireux-${app.ecosystem}`,
    ...(appDatabaseRuntimeModule ? [appDatabaseRuntimeModule] : []),
    // VueFire/Firebase wiring lives in fireux-nuxtfire.
    'fireux-nuxtfire',
    'fireux-core',
    ...(app.role === 'global' ? ['fireux-ecosystem-controller'] : []),
    '@vite-pwa/nuxt',
    ...(app.modules || []),
  ]

  // Keep icon resolution consistent across all Firebase/Cloud Run deployments.
  // This avoids app-level drift where only some apps force remote icon bundles.
  ;(nuxt as any).icon = {
    ...((nuxt as any).icon || {}),
    serverBundle: 'remote',
  }

  // FireUX baseline for console page body spacing.
  // App-level app.config.ts can still override this when needed.
  const appConfig = (((nuxt as any).appConfig ||= {}) as Record<string, any>)
  const uiConfig = ((appConfig.ui ||= {}) as Record<string, any>)
  const consolePanel = ((uiConfig.consolePanel ||= {}) as Record<string, any>)
  const slots = ((consolePanel.slots ||= {}) as Record<string, any>)
  slots.body ||= 'px-2 sm:px-4'



  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
    'fireux-core/runtime/assets/styles/main.scss',
  ]

  const envDomain = reqEnv('APP_DOMAIN')
  const envPin = optEnv('DEVELOPER_PIN')
  const envDeveloperId =
    optEnv('DEVELOPER_ID') ||
    optEnv('DEVELOPER_UID') ||
    optEnv('NUXT_PUBLIC_DEVELOPER_ID')
  const envFirebaseApiKey = optEnv('NUXT_FIREBASE_API_KEY')
  const envFirebaseAppId = reqEnv('NUXT_FIREBASE_APP_ID')
  const envFirebaseMeasurementId = optEnv('NUXT_FIREBASE_MEASUREMENT_ID')
  const envPlacesApiKey =
    optEnv('GOOGLE_PLACES_API_KEY') ||
    optEnv('NUXT_GOOGLE_PLACES_API_KEY') ||
    optEnv('NUXT_PUBLIC_GOOGLE_PLACES_API_KEY')
  const moduleNames = (nuxt.modules || [])
    .map(moduleName)
    .filter(Boolean) as string[]

  if (envPlacesApiKey) {
    const rc = ((nuxt as any).runtimeConfig ||= {}) as Record<string, any>
    const pub = (rc.public ||= {}) as Record<string, any>
    rc.googlePlacesApiKey ||= envPlacesApiKey
    pub.googlePlacesApiKey ||= envPlacesApiKey
  }
  setRuntime(nuxt, {
    app: {
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      appThumbnail: brandAssets.thumbnail,
      appLogo: brandAssets.logo,
      appLogoLight: brandAssets.logoLight,
      appLogoDark: brandAssets.logoDark,
      ...(app.contactEmail ? { contactEmail: app.contactEmail } : {}),
      ...(envDeveloperId ? { developerId: envDeveloperId } : {}),
      domain: envDomain,
      ...(app.seo?.siteUrl ? { siteUrl: app.seo.siteUrl } : {}),
      role: app.role,
      ecosystem: app.ecosystem,
      modules: moduleNames,
      consoles: app.consoles || [],
    },

    firebaseApp: {
      ...(envFirebaseApiKey ? { apiKey: envFirebaseApiKey } : {}),
      appId: envFirebaseAppId,
      ...(envFirebaseMeasurementId ? { measurementId: envFirebaseMeasurementId } : {}),
    },

    private: {
      developerPin: envPin,
      ...(app.seo ? { seo: app.seo } : {}),
      ...(app.meta ? { meta: app.meta } : {}),
    },
  })


  configPwa(nuxt, {
    name: app.name,
    shortName: app.shortName,
    themeColor: '#000000',
    backgroundColor: '#000000',
    lang: 'en',
    role: app.role,
  })

  configNitroFirebase(nuxt, {
    serverFunctionName: toValidJsIdentifier(app.id),
    region: process.env.NITRO_FIREBASE_REGION || defaultNitroFirebaseRegion(app.ecosystem),
  })

  configViteWorkspace(nuxt)

  return nuxt
}
