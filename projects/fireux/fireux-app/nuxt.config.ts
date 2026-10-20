import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const docsEnabled =
  process.env.NODE_ENV === 'production' ||
  process.env.FIREUX_DOCS_ENABLED === 'true'

const appConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  context: "FireUX is the main entrance for organising Projects and preparing Apps. Project management and App preparation are distinct from provisioning, deployment and release.",
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
    staticPaths: ['/product', '/apps', '/ecosystems', '/ecosystems/werkbox'],
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

export default {
  ...appConfig,
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
