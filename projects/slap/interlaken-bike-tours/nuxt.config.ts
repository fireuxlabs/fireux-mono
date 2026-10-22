import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from '@nuxt/schema'
import type { ModuleOptions as IconOptions } from '@nuxt/icon'
import type { ModuleOptions as UIOptions } from '@nuxt/ui'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { identity } from './app/ignition/brief'
import { searchPlan } from './app/ignition/search'

const fireux = defineFireuxConfig({
  ...identity,
  extends: ['fireux-core/layer', 'fireux-slap/layer', 'fireux-blogs/layer'],
  contactEmail: 'info@interlakenbiketours.com',
  theme: {
    palette: {
      canvas: '#f6f5ed',
      surface: '#e8ecdf',
      canvas_inverted: '#193e33',
      text: '#183c32',
      text_muted: '#52675c',
      ink: '#193e33',
      accent: '#285a42',
      accent_contrast: '#ffffff',
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
