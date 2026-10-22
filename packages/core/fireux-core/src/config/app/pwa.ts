// packages/core/fireux-core/src/config/pwa.ts
import type { NuxtConfig } from '@nuxt/schema'
import { resolveFireuxBrandAssets } from '../../utils/brandAssets'

export type FireUXPwaConfig = {
  id: string
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
    // Core's client controller registers only after an explicit offline request.
    // The Nuxt module's own plugin is a separate automatic-registration path.
    injectRegister: false,
    client: { registerPlugin: false, installPrompt: false },
    registerType: 'prompt',
    // Keep service worker disabled during local development by default.
    devOptions: { enabled: false },
    workbox: {
      ...(((nuxt as any).pwa?.workbox || {}) as Record<string, unknown>),
      cacheId: `fireux-${c.id}`,
      navigateFallback: null,
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: false,
      // Offline support never stores SSR HTML, payloads or operational data.
      globPatterns: ['fireux-offline.html'],
      globIgnores: ['**/*.json', '**/_payload*'],
      // Nuxt's default transform rewrites .html URLs and adds build payloads.
      // This standalone document retains one exact precache/fallback identity.
      manifestTransforms: [
        (entries: Array<{ url: string; revision?: string | null }>) => ({
          manifest: entries.filter(
            (entry) => entry.url === 'fireux-offline.html'
          ),
          warnings: [],
        }),
      ],
      runtimeCaching: [
        {
          urlPattern: ({ request, url }: { request: Request; url: URL }) => {
            const path = url.pathname.slice(
              self.location.pathname.lastIndexOf('/')
            )
            return (
              request.mode === 'navigate' &&
              url.origin === self.location.origin &&
              !/^\/(?:api|auth|__)(?:\/|$)/.test(path)
            )
          },
          handler: 'NetworkOnly',
          options: {
            precacheFallback: { fallbackURL: 'fireux-offline.html' },
          },
        },
      ],
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
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    { name: 'mobile-web-app-capable', content: 'yes' }
  )

  head.link.push(
    { rel: 'icon', href: brandAssets.favicon },
    {
      key: 'fireux-apple-touch-icon',
      rel: 'apple-touch-icon',
      sizes: '192x192',
      href: brandAssets.pwaIcon192,
    }
  )
}
