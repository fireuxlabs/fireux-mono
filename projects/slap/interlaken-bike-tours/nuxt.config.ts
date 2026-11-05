import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from '@nuxt/schema'
import type { ModuleOptions as IconOptions } from '@nuxt/icon'
import type { ModuleOptions as UIOptions } from '@nuxt/ui'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { identity } from './app/ignition/brief'
import { searchPlan } from './app/ignition/search'

const fireux = defineFireuxConfig({
  ...identity,
  extends: ['fireux-core/layer', 'fireux-slap/layer', 'fireux-businesses/layer'],
  workspaceConfig: { business: { canCreate: true } },
  subscriptionCapacity: { business: { free: 1, pro: 1, business: null }, 'business.team': { free: 1, pro: 5, business: 50 } },
  contactEmail: 'info@interlakenbiketours.com',
  theme: {
    palette: {
      canvas: '#f5f5f1',
      surface: '#e9eceb',
      canvas_inverted: '#07162d',
      text: '#101d31',
      text_muted: '#687382',
      ink: '#07162d',
      accent: '#10d4dd',
      accent_contrast: '#07162d',
    },
  },
  seo: {
    siteUrl: searchPlan.origin,
    disallowPaths: searchPlan.mode === 'public' ? [] : ['/'],
    noindexPaths:
      searchPlan.mode === 'public'
        ? searchPlan.pages.filter((page) => !page.index).map((page) => page.path)
        : ['/', '/**'],
    staticPaths: searchPlan.pages
      .filter((page) => page.sitemap)
      .map((page) => page.path),
  },
})

const config: NuxtConfig & {
  ui: Partial<UIOptions>
  icon: Partial<IconOptions>
} = {
  ...fireux,
  css: [...(fireux.css || []), '~/assets/css/main.css'],
  ui: { fonts: false } satisfies Partial<UIOptions>,
  icon: {
    clientBundle: {
      icons: ['lucide:arrow-up-right', 'lucide:arrow-down-right'],
    },
  },
  app: {
    ...fireux.app,
    head: {
      ...fireux.app?.head,
      link: [
        ...(fireux.app?.head?.link || []),
        {
          key: 'fireux-apple-touch-icon',
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/img/app/pwa/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/img/app/favicon.png',
        },
      ],
    },
  },
}

export default defineNuxtConfig(config)
