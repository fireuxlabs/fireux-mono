import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const docsEnabled =
  process.env.NODE_ENV === 'production' ||
  process.env.FIREUX_DOCS_ENABLED === 'true'

const appConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  context:
    'FireUX is an industry SaaS framework combining shared SaaS foundations with industry libraries to create connected Apps and Workspaces. Its public offering serves industry founders and development teams through framework resources, scoped industry SaaS work and branded App requests. Nuxt and Nuxt UI provide the technical and interface foundation. Project Workspace remains the separate working entrance for organising Projects and preparing Apps; provisioning, deployment and release retain their own authority.',
  name: 'FireUX',
  shortName: 'FireUX',
  role: 'global',
  selfJoinEnabled: true,
  workspaces: ['project'],
  subscriptionCapacity: {
    project: { free: 1, premium: 1, business: null },
    'project.team': { free: 3, premium: 7, business: null },
    'project.test': { free: 2, premium: 10, business: null },
  },
  seo: {
    siteUrl: 'https://fireux.app',
    staticPaths: [
      '/',
      '/getting-started',
      '/components',
      '/theme',
      '/templates',
      '/product',
      '/apps',
      '/ecosystems',
      '/ecosystems/werkbox',
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
    ...(docsEnabled ? ['fireux-docs'] : []),
  ],
  extends: [
    ...(docsEnabled ? ['fireux-docs/layer'] : []),
    'fireux-fireux/layer',
    'fireux-blogs/layer',
    'fireux-products/layer',
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
    accountConnections: {
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://fireux.app'
          : 'http://localhost:3000',
      miseboxOrigin:
        process.env.NODE_ENV === 'production'
          ? 'https://misebox.app'
          : 'http://localhost:3001',
      peerSecret: '',
      databaseId: '',
    },
  },
}
