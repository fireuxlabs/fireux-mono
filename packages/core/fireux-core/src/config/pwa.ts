// packages/core/fireux-core/src/config/pwa.ts
import type { NuxtConfig } from 'nuxt/schema'

export type FireUXPwaConfig = {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
  lang: string
}

export function configPwa(nuxt: NuxtConfig, c: FireUXPwaConfig) {
  nuxt.modules ||= []
  nuxt.modules.push([
    '@vite-pwa/nuxt',
    {
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: { navigateFallback: '/' },
      manifest: {
        name: c.name,
        short_name: c.shortName,
        description: c.description,
        scope: '/',
        start_url: '/',
        display: 'standalone',
        background_color: c.backgroundColor,
        theme_color: c.themeColor,
        lang: c.lang,
        icons: [
          { src: '/img/app/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/img/app/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    },
  ])

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
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/app/pwa/icon-192.png' }
  )
}