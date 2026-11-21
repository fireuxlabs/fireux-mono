import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from '@nuxt/schema'
import type { ModuleOptions as IconOptions } from '@nuxt/icon'
import type { ModuleOptions as UIOptions } from '@nuxt/ui'
import { defineFireuxApp } from 'fireux-app/config'

const fireux = defineFireuxApp({
  id: 'interlaken-bike-tours',
  ecosystem: 'slap',
  ecosystemId: 'slap',
  projectId: 'slap',
  name: 'Interlaken Bike Tours',
  shortName: 'Bike Tours',
  role: 'tenant',
  modules: [
    'fireux-workspace',
    'fireux-businesses',
    ['fireux-bookings', { businessWorkspace: true }],
  ],
  context:
    'A customer-facing prototype for premium private guided rides. Visitors can check the configured departure against working days, closed dates and Ben’s Google Calendar and confirm one private tour per day at the catalog price per person; the App stores a booking record and the shared FireUX Bookings package owns confirmation orchestration and Calendar transport. The Business Workspace provides profile/contact details, linked locations, a Team roster, availability settings and private booking records. Public bookings require a server-configured Business id and Calendar credentials. No payment, outbound confirmation email or cancellation flow is implemented. Prices and operating capacity require operator review before release.',
  extends: [
    'fireux-core/layer',
    'fireux-slap/layer',
    'fireux-businesses/layer',
    'fireux-bookings/layer',
  ],
  workspaces: ['business'],
  workspaceConfig: { business: { canCreate: true } },
  subscriptionCapacity: {
    business: { free: 1, pro: 1, business: null },
    'business.team': { free: 1, pro: 5, business: 50 },
  },
  contactEmail: 'info@interlakenbiketours.com',
  seo: {
    siteUrl: 'https://interlaken-bike-tours-prototype.web.app',
    disallowPaths: ['/'],
    noindexPaths: ['/', '/**'],
    staticPaths: [],
  },
})

const config: NuxtConfig & {
  ui: Partial<UIOptions>
  icon: Partial<IconOptions>
} = {
  ...fireux,
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
