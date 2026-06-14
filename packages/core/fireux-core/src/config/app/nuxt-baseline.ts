import type { NuxtConfig } from '@nuxt/schema'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { withDefaultAppModules } from './modules'
import type { FireuxAppConfig } from './types'

export function configureViewport(nuxt: NuxtConfig) {
  // Ensure responsive breakpoints behave correctly on mobile.
  const head: any = ((nuxt as any).app ||= {}).head ||= {}
  const meta: any[] = (head.meta ||= [])
  const hasViewport = meta.some((m) => m?.name === 'viewport')
  if (!hasViewport) {
    meta.push({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
  }
}

export function configureNitroBaseline(nuxt: NuxtConfig) {
  ;(nuxt as any).compatibilityDate = '2025-12-22'
  const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
  nuxtWithNitro.nitro = {
    ...(nuxtWithNitro.nitro || {}),
    compatibilityDate: '2025-12-22',
  }
}

export function configureProjectPublicAssets(nuxt: NuxtConfig) {
  const projectPublicDir = resolve(process.cwd(), 'public')
  if (!existsSync(projectPublicDir)) return

  const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
  const publicAssets = ((nuxtWithNitro.nitro as any).publicAssets ||= []) as Array<
    string | { dir: string; maxAge?: number; baseURL?: string }
  >
  const already = publicAssets.some((entry) =>
    typeof entry === 'string'
      ? entry === projectPublicDir
      : entry?.dir === projectPublicDir
  )
  if (!already) publicAssets.push({ dir: projectPublicDir })
}

export function configureNuxtRuntimeDefaults(nuxt: NuxtConfig) {
  nuxt.experimental = {
    ...(nuxt.experimental || {}),
    appManifest: process.env.NODE_ENV === 'production',
    scanPageMeta: true,
  }

  nuxt.srcDir = 'app'
  nuxt.buildDir = 'app/.nuxt'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }
}

export function configureAppModules(
  nuxt: NuxtConfig,
  app: FireuxAppConfig,
  appDatabaseRuntimeModule: unknown
) {
  nuxt.modules = [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/icon',
    `fireux-${app.ecosystem}`,
    ...(appDatabaseRuntimeModule ? [appDatabaseRuntimeModule] : []),
    'fireux-nuxtfire',
    'fireux-core',
    ...(app.role === 'global' ? ['fireux-ecosystem-controller'] : []),
    '@vite-pwa/nuxt',
    ...withDefaultAppModules(app.modules),
  ] as NonNullable<NuxtConfig['modules']>
}

export function configureIconServerBundle(nuxt: NuxtConfig) {
  ;(nuxt as any).icon = {
    ...((nuxt as any).icon || {}),
    serverBundle: 'remote',
  }
}

export function configureConsolePanelDefaults(nuxt: NuxtConfig) {
  const appConfig = (((nuxt as any).appConfig ||= {}) as Record<string, any>)
  const uiConfig = ((appConfig.ui ||= {}) as Record<string, any>)
  const consolePanel = ((uiConfig.consolePanel ||= {}) as Record<string, any>)
  const slots = ((consolePanel.slots ||= {}) as Record<string, any>)
  slots.body ||= 'px-2 sm:px-4'
}

export function configureCoreCss(nuxt: NuxtConfig) {
  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
    'fireux-core/runtime/assets/styles/main.scss',
  ]
}
