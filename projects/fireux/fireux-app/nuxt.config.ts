import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  name: 'FireUX',
  shortName: 'FireUX',
  role: 'global',
  selfJoinEnabled: true,
  workspaces: ['project'],
  subscriptionCapacity: {
    project: { free: 1, premium: 1, business: null },
    'project.team': { free: 3, premium: 7, business: null },
    'project.test': { free: 2, premium: 3, business: null },
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
  ],
})
