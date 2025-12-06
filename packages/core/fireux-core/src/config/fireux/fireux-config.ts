import type { NuxtConfig } from 'nuxt/schema'
import { primeEcosystemFirebaseEnv } from '../firebase-env'
import { resolveFireuxNuxtSetup } from './tenant-context'
import type { TenantConfig } from './tenant-config'

const DEFAULT_THEME_COLOR = '#0f172a'

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  primeEcosystemFirebaseEnv(opts.ecosystem)
  const setup = resolveFireuxNuxtSetup(opts)
  const themeColor = setup.themeColor || DEFAULT_THEME_COLOR

  return {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },
    modules: setup.modules,
    app: {
      head: {
        title: setup.appName,
        meta: [
          { name: 'theme-color', content: themeColor },
          { name: 'apple-mobile-web-app-capable', content: 'yes' },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black-translucent',
          },
          { name: 'mobile-web-app-capable', content: 'yes' },
        ],
        link: [
          { rel: 'manifest', href: '/manifest.webmanifest' },
          { rel: 'icon', href: '/favicon.ico' },
          {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/img/app/pwa/icon-192.png',
          },
        ],
      },
    },
    runtimeConfig: setup.runtimeConfig,
    compatibilityDate: setup.compatibilityDate,
    vite: setup.vite,
    nitro: setup.nitro,
  }
}
