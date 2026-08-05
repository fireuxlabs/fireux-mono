import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-app',
  name: 'FireUX',
  shortName: 'FireUX',
  role: 'global',
  designPack: { preset: 'sci-fire' },
  consoles: ['project'],
  seo: {
    staticPaths: ['/apps', '/ecosystems', '/ecosystems/werkbox'],
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
