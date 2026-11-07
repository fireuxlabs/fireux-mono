import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

const appConfig = defineFireuxEcosystem({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  context:
    'FireUX is an industry SaaS framework combining shared SaaS foundations with industry libraries to create connected Apps and Workspaces. Its public offering serves industry founders and development teams through framework resources, scoped industry SaaS work and branded App requests. Nuxt and Nuxt UI provide the technical and interface foundation. Project Workspace remains the separate working entrance for organising Projects and preparing Apps; provisioning, deployment and release retain their own authority.',
  name: 'FireUX',
  shortName: 'FireUX',
  role: 'global',
  workspaces: ['project'],
  subscriptionCapacity: {
    project: { free: 1, pro: 1, business: null },
    'project.team': { free: 3, pro: 7, business: null },
  },
  seo: {
    siteUrl: 'https://fireux.app',
    staticPaths: [
      '/',
      '/getting-started',
      '/components',
      '/docs',
      '/docs/configuration',
      '/docs/pages',
      '/docs/layouts',
      '/docs/server',
      '/docs/components',
      '/docs/components/bookings',
      '/docs/components/collections',
      '/docs/components/state-feedback',
      '/docs/components/selection',
      '/docs/components/surfaces',
      '/docs/components/disclosure-card',
      '/docs/components/diagnostics',
      '/docs/composables',
      '/docs/composables/useApp',
      '/patterns/page-composition',
      '/capabilities',
      '/theme',
      '/templates',
      '/product',
      '/apps',
      '/ecosystems',
    ],
    sitemapDocuments: ['/sitemaps/directory.xml'],
    noindexPaths: ['/apps/fireux-blank'],
  },
  modules: [
    [
      'fireux-products',
      {
        productKinds: [
          'saas_app',
          'industry_app',
          'white_label_app',
          'ecosystem_white_label',
          'template',
          'modules_pass',
          'service',
        ],
      },
    ],
  ],
  extends: [
    'fireux-docs/layer',
    'fireux-projects/layer',
    'fireux-fireux/layer',
  ],
})

const firebaseOptions = appConfig.nitro?.firebase

export default {
  ...appConfig,
  nitro: {
    ...appConfig.nitro,
    firebase: {
      ...firebaseOptions,
      httpsOptions: {
        ...(firebaseOptions && 'httpsOptions' in firebaseOptions
          ? firebaseOptions.httpsOptions
          : {}),
        maxInstances: 20,
      },
    },
  },
  runtimeConfig: {
    ...appConfig.runtimeConfig,
    public: { ...appConfig.runtimeConfig?.public, packageComponents: {} },
  },
}
