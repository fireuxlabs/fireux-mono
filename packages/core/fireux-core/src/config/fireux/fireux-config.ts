import type { NuxtConfig } from 'nuxt/schema'
import { dedupeKeepLast, type ModuleEntry } from './module-utils'
import { env, requireEnv, resolveWorkspaceRoot } from './env'
import { readServiceAccount } from './service-account'
import { createNitroConfig } from './nitro-config'
import { createVuefireConfig } from './vuefire-config'
import { createPwaConfig } from './pwa-config'
import { createRuntimeConfig } from './runtime-config'

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  role: 'global' | 'tenant'
  modules?: ModuleEntry[]
  includeCore?: boolean
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
  nitro?: NuxtConfig['nitro']
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  const ecosystem = opts.ecosystem.trim()
  if (!ecosystem) {
    throw new Error('[fireux] createFireuxConfig requires an ecosystem name.')
  }

  const appName = opts.appName.trim()
  if (!appName) {
    throw new Error('[fireux] createFireuxConfig requires appName.')
  }

  const appShortName = opts.appShortName.trim()
  if (!appShortName) {
    throw new Error('[fireux] createFireuxConfig requires appShortName.')
  }

  const role = opts.role

  const primaryColor = opts.primaryColor ?? env('APP_PRIMARY_COLOR')
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')
  const secondaryColor = opts.secondaryColor ?? env('APP_SECONDARY_COLOR')
  const centralSignupUrl = env('CENTRAL_SIGNUP_URL')
  const appIcon = env('APP_ICON')
  const developerPin = env('PIN')

  const serviceAccount = readServiceAccount(ecosystem)
  const vuefireConfig = createVuefireConfig({
    overrides: opts.vuefire,
    serviceAccount: serviceAccount?.credentials,
  })
  const pwaConfig = createPwaConfig({
    appName,
    appShortName,
    themeColor: primaryColor,
    overrides: opts.pwa,
  })

  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', vuefireConfig],
    ['@vite-pwa/nuxt', pwaConfig],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const modules = dedupeKeepLast([...base, ...(opts.modules ?? [])])

  const nitroConfig = createNitroConfig(opts.nitro)

  const appId = requireEnv('APP_ID')
  const globalAppId = ecosystem ? `${ecosystem}-app` : undefined
  const devMode = process.env.NODE_ENV !== 'production'
  const firebaseConfig = vuefireConfig.config ?? {}
  const runtimeConfig = createRuntimeConfig({
    ecosystem,
    appId,
    appName,
    appShortName,
    role,
    modules,
    primaryColor,
    neutralColor,
    secondaryColor,
    centralSignupUrl,
    appIcon,
    developerPin,
    firebaseConfig,
    serviceAccountJson: serviceAccount?.json,
    globalAppId,
    devMode,
  })

  // dev-only, minimal Vite fs.allow: just the workspace root
  const devFsAllow = devMode ? [resolveWorkspaceRoot()] : []

  const config: NuxtConfig = {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },

    modules,
    app: { head: { title: appName } },

    runtimeConfig,

    compatibilityDate: (opts.compatibilityDate ??
      '2025-09-01') as NuxtConfig['compatibilityDate'],

    vite: devFsAllow.length
      ? { server: { fs: { allow: devFsAllow } } }
      : undefined,

    nitro: nitroConfig,
  }

  return config
}
