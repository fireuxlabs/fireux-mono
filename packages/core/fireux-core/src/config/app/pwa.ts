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
    manifest: {
      ...(((nuxt as any).pwa?.manifest || {}) as Record<string, unknown>),
      name: c.name,
      short_name: c.shortName,
      scope: '/',
      start_url: '/',
      display: 'standalone',
      background_color: c.backgroundColor,
      theme_color: c.themeColor,
      lang: c.lang,
      icons: [
        { src: brandAssets.pwaIcon192, sizes: '192x192', type: 'image/png' },
        { src: brandAssets.pwaIcon512, sizes: '512x512', type: 'image/png' },
      ],
    },
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
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'icon', href: brandAssets.favicon },
    { rel: 'apple-touch-icon', sizes: '180x180', href: brandAssets.pwaIcon192 }
  )
}
