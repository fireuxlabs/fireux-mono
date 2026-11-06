// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: bind baseline-only modules to their package owner.
import type { NuxtConfig } from '@nuxt/schema'
import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { moduleName } from './modules'

export const FIREUX_PAGE_TRANSITION = {
  name: 'fx-page',
  mode: 'out-in',
} as const

export function configureViewport(nuxt: NuxtConfig) {
  // Ensure responsive breakpoints behave correctly on mobile.
  const head: any = (((nuxt as any).app ||= {}).head ||= {})
  const meta: any[] = (head.meta ||= [])
  const hasViewport = meta.some((m) => m?.name === 'viewport')
  if (!hasViewport) {
    meta.push({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    })
  }
}

export function configurePageTransition(nuxt: NuxtConfig) {
  const app = ((nuxt as any).app ||= {}) as Record<string, any>
  app.pageTransition = { ...FIREUX_PAGE_TRANSITION }
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
  const publicAssets = ((nuxtWithNitro.nitro as any).publicAssets ||=
    []) as Array<string | { dir: string; maxAge?: number; baseURL?: string }>
  const already = publicAssets.some((entry) =>
    typeof entry === 'string'
      ? entry === projectPublicDir
      : entry?.dir === projectPublicDir
  )
  if (!already) publicAssets.push({ dir: projectPublicDir })
}

export function configureNuxtRuntimeDefaults(nuxt: NuxtConfig) {
  nuxt.future = {
    ...(nuxt.future || {}),
    compatibilityVersion: 5,
  }

  nuxt.experimental = {
    ...(nuxt.experimental || {}),
    appManifest: process.env.NODE_ENV === 'production',
    // Nuxt 5 compatibility disables Nitro auto-imports by default, but the
    // current package server runtimes still consume Nuxt's #imports alias.
    // Keep this bridge centralized pending the Nitro 3 migration contract.
    nitroAutoImports: true,
    scanPageMeta: true,
  }

  nuxt.srcDir = 'app'
  nuxt.buildDir = 'app/.nuxt'
  nuxt.imports = { dirs: ['composables/**', 'utils/**'] }

  if (process.env.NODE_ENV === 'production') {
    nuxt.sourcemap = { client: false, server: false }
    const nuxtWithNitro = nuxt as NuxtConfig & { nitro?: Record<string, any> }
    const nitro = (nuxtWithNitro.nitro ||= {})
    nitro.sourceMap = false
  }
}

export function configureFireuxModuleRestartWatch(nuxt: NuxtConfig) {
  const require = createRequire(resolve(process.cwd(), 'package.json'))
  const watch = (nuxt.watch ||= [])
  const moduleNames = (nuxt.modules || [])
    .map(moduleName)
    .filter((name): name is string => Boolean(name?.startsWith('fireux-')))

  for (const name of moduleNames) {
    let modulePath = ''
    try {
      modulePath = require.resolve(name, {
        paths: [
          process.cwd(),
          ...(nuxt.modulesDir || []).filter(
            (directory): directory is string => typeof directory === 'string'
          ),
        ],
      })
    } catch {
      continue
    }

    const configDirectory = resolve(dirname(modulePath), 'config/module')
    const configSources = existsSync(configDirectory)
      ? collectFiles(configDirectory)
      : []
    for (const source of [modulePath, ...configSources]) {
      if (!watch.includes(source)) watch.push(source)
    }
  }
}

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const source = resolve(directory, entry.name)
    return entry.isDirectory() ? collectFiles(source) : [source]
  })
}

export function configureIconServerBundle(nuxt: NuxtConfig) {
  ;(nuxt as any).icon = {
    ...((nuxt as any).icon || {}),
    serverBundle: 'remote',
  }
}

export function configureCoreCss(nuxt: NuxtConfig) {
  const appCss = resolve(process.cwd(), 'app/assets/styles/main.css')
  nuxt.css = [
    'fireux-core/runtime/assets/styles/main.css',
    'fireux-core/runtime/assets/styles/main.scss',
    ...(existsSync(appCss) ? ['@/assets/styles/main.css'] : []),
  ]
}
