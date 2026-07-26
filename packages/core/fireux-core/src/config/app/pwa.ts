// packages/core/fireux-core/src/config/pwa.ts
import type { NuxtConfig } from '@nuxt/schema'
import { resolveFireuxBrandAssets } from '../../utils/brandAssets'

export type FireUXPwaConfig = {
  name: string
  shortName: string
  themeColor: string
  backgroundColor: string
  lang: string
}

export function configPwa(nuxt: NuxtConfig, c: FireUXPwaConfig) {
  const brandAssets = resolveFireuxBrandAssets()
  ;(nuxt as any).pwa = {
    ...((nuxt as any).pwa || {}),
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    // Keep service worker disabled during local development by default.
    devOptions: { enabled: false },
    workbox: {
      ...(((nuxt as any).pwa?.workbox || {}) as Record<string, unknown>),
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      // Firebase Auth redirect flows use /__/auth/* and must bypass the app-shell
      // fallback, especially in installed PWAs where redirect auth is more common.
      navigateFallbackDenylist: [/^\/__\//],
    },
    // Core's server route owns the manifest so it can version configured assets
    // with Nuxt's per-build id. Keep Vite PWA focused on service-worker behavior.
    manifest: false,
  }

  const app = (nuxt.app ||= {} as any)
  const head = (app.head ||= {} as any)
  head.meta ||= []
  head.link ||= []

  head.meta.push(
    { name: 'theme-color', content: c.themeColor },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'mobile-web-app-capable', content: 'yes' }
  )

  head.link.push(
    { rel: 'icon', href: brandAssets.favicon },
    { rel: 'apple-touch-icon', sizes: '180x180', href: brandAssets.pwaIcon192 }
  )
}
