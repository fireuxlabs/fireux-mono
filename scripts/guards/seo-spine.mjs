// @fireux-script
// last_used: 2026-08-03
// usage_note: run through pnpm guard; protects shared search indexing and sitemap identity.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DOCUMENT_ID_MODULES = [
  'packages/extensions/fireux-places/src/module.ts',
  'packages/extensions/fireux-companies/src/module.ts',
  'packages/extensions/fireux-properties/src/module.ts',
  'packages/extensions/fireux-suppliers/src/module.ts',
]

const read = (repoRoot, relative) =>
  readFileSync(join(repoRoot, relative), 'utf8')

export async function run({ repoRoot }) {
  const violations = []
  const config = read(
    repoRoot,
    'packages/core/fireux-core/src/config/app/seo.ts'
  )
  const staticPaths = read(
    repoRoot,
    'packages/core/fireux-core/src/config/app/static-paths.ts'
  )
  const runtime = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/seo-sitemaps.ts'
  )
  const sitemapIndex = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/sitemaps/index.xml.get.ts'
  )
  const useSeo = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/seo/useSeo.ts'
  )

  for (const route of [
    '/workspace/**',
    '/dashboard/**',
    '/account/**',
    '/member/**',
  ]) {
    if (!config.includes(`'${route}'`)) {
      violations.push(`Core noindex defaults must include ${route}.`)
    }
  }

  const entitySeoComposables = [
    'packages/extensions/fireux-jobs/src/runtime/job/composables/useJobSeo.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenSeo.ts',
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientSeo.ts',
    'packages/extensions/fireux-places/src/runtime/place/composables/usePlaceSeo.ts',
    'packages/extensions/fireux-products/src/runtime/product/composables/useProductSeo.ts',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierSeo.ts',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioSeo.ts',
  ]
  for (const relative of entitySeoComposables) {
    if (!existsSync(join(repoRoot, relative))) {
      violations.push(
        `${relative}: public Entity SEO must stay with its Entity.`
      )
    }
  }
  for (const status of ['coming-soon', 'planned', 'later']) {
    if (!staticPaths.includes(`'${status}'`)) {
      violations.push(
        `Solution sitemap discovery must exclude ${status} literature.`
      )
    }
  }
  if (!staticPaths.includes('NON_INDEXABLE_SOLUTION_STATUSES.has')) {
    violations.push(
      'Solution sitemap discovery must apply the non-indexable status gate.'
    )
  }
  for (const marker of [
    'if (solution.external === true) return undefined',
    '/^https?:\\/\\//i.test(destination)',
    'resolveLocalSolutionPath(solution)',
  ]) {
    if (!staticPaths.includes(marker)) {
      violations.push(
        `Solution sitemap discovery must retain canonical-destination handling: ${marker}.`
      )
    }
  }

  if (!config.includes("routeIdentity?: 'document-id' | 'field'")) {
    violations.push('SEO config must declare explicit sitemap route identity.')
  }
  if (!runtime.includes("entity.routeIdentity === 'document-id'")) {
    violations.push('Sitemap runtime must resolve document-id route identity.')
  }
  if (!runtime.includes('isFirestoreDocumentId(docId) ? docId.trim()')) {
    violations.push(
      'Document-id sitemap routes must preserve the exact storage key.'
    )
  }
  if (!config.includes('addDocument: (path: string) => void')) {
    violations.push(
      'Core must expose the extension-owned sitemap document seam.'
    )
  }
  for (const marker of [
    'sitemapDocuments?: string[]',
    '...(options.seo?.sitemapDocuments || [])',
  ]) {
    if (!config.includes(marker)) {
      violations.push(
        `Core App-owned sitemap document configuration must retain ${marker}.`
      )
    }
  }
  if (!runtime.includes('toStrings(seo.sitemapDocuments)')) {
    violations.push('Sitemap runtime must consume custom sitemap documents.')
  }
  if (
    !sitemapIndex.includes(
      '...documents.map((path) => absoluteUrl(siteUrl, path))'
    )
  ) {
    violations.push(
      'Sitemap index must publish extension-owned sitemap documents.'
    )
  }
  for (const type of ['Organization', 'WebSite', 'WebPage']) {
    if (!useSeo.includes(`'@type': '${type}'`)) {
      violations.push(`Core App landing JSON-LD must connect ${type}.`)
    }
  }
  if (!useSeo.includes(".replace(/</g, '\\\\u003c')")) {
    violations.push('Core must safely serialize public JSON-LD script content.')
  }
  if (!useSeo.includes('...(language ? { inLanguage: language } : {})')) {
    violations.push('Core App landing JSON-LD must retain explicit language.')
  }
  for (const marker of [
    'export function buildPublicPageJsonLd',
    "pageType?: 'CollectionPage' | 'WebPage'",
    "'@type': 'ItemList'",
    "isPartOf: { '@id': `${siteUrl}#website` }",
  ]) {
    if (!useSeo.includes(marker)) {
      violations.push(`Core public-page JSON-LD must retain ${marker}.`)
    }
  }

  const sharedPublicPages = [
    'packages/core/fireux-core/src/runtime/pages/operations/index.vue',
    'packages/core/fireux-core/src/runtime/pages/operations/[slug].vue',
    'packages/core/fireux-core/src/runtime/pages/solutions/index.vue',
    'packages/core/fireux-core/src/runtime/pages/solutions/[slug].vue',
  ]
  for (const relative of sharedPublicPages) {
    const source = read(repoRoot, relative)
    if (!source.includes('useSeo({')) {
      violations.push(`${relative} must consume the shared SEO seam.`)
    }
    if (source.includes('useSeoMeta({')) {
      violations.push(`${relative} must not bypass the shared SEO seam.`)
    }
    if (!source.includes('buildPublicPageJsonLd({')) {
      violations.push(`${relative} must publish connected public-page JSON-LD.`)
    }
  }
  const solutionDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/solutions/[slug].vue'
  )
  for (const marker of [
    'canonicalDestination.value !== solutionPath.value',
    'redirectCode: 301',
    "isIndexable.value ? 'index, follow' : 'noindex, nofollow'",
  ]) {
    if (!solutionDetail.includes(marker)) {
      violations.push(
        `Solution detail canonical handling must retain ${marker}.`
      )
    }
  }

  const fireuxPublicOverrides = [
    'projects/fireux/fireux-app/app/pages/apps/index.vue',
    'projects/fireux/fireux-app/app/pages/apps/[id].vue',
    'projects/fireux/fireux-app/app/pages/ecosystems/index.vue',
    'projects/fireux/fireux-app/app/pages/ecosystems/[id].vue',
    'projects/fireux/fireux-app/app/pages/ecosystems/misebox/explore.vue',
    'projects/fireux/fireux-app/app/pages/ecosystems/werkbox/explore.vue',
    'projects/fireux/fireux-app/app/pages/solutions/index.vue',
    'projects/fireux/fireux-app/app/pages/solutions/cleaning.vue',
    'projects/fireux/fireux-app/app/pages/solutions/fireux-app.vue',
    'projects/fireux/fireux-app/app/pages/solutions/fireux-template.vue',
    'projects/fireux/fireux-app/app/pages/operations/apps.vue',
    'projects/fireux/fireux-app/app/pages/operations/ecosystem.vue',
  ]
  for (const relative of fireuxPublicOverrides) {
    const source = read(repoRoot, relative)
    if (!source.includes('useSeo({')) {
      violations.push(`${relative} must consume the shared SEO seam.`)
    }
    if (source.includes('useSeoMeta({')) {
      violations.push(`${relative} must not bypass the shared SEO seam.`)
    }
  }

  const fireuxDirectoryReader = read(
    repoRoot,
    'projects/fireux/fireux-app/server/utils/default-directory.ts'
  )
  const fireuxAppsReader = read(
    repoRoot,
    'projects/fireux/fireux-app/server/utils/apps.ts'
  )
  const fireuxDirectoryApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/directory.get.ts'
  )
  const fireuxDirectorySitemap = read(
    repoRoot,
    'projects/fireux/fireux-app/server/routes/sitemaps/directory.xml.get.ts'
  )
  const fireuxDirectoryPolicy = read(
    repoRoot,
    'projects/fireux/fireux-app/app/utils/directorySearchPolicy.ts'
  )
  const fireuxDirectoryTargets = read(
    repoRoot,
    'projects/fireux/fireux-app/server/config/platform-directory-targets.ts'
  )
  const fireuxAppDetail = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/apps/[id].vue'
  )
  for (const source of [fireuxDirectoryApi, fireuxDirectorySitemap]) {
    if (!source.includes('readPlatformDirectory')) {
      violations.push(
        'FireUX directory JSON and sitemap transport must share the bounded directory reader.'
      )
      break
    }
  }
  for (const marker of [
    'PLATFORM_DIRECTORY_TARGETS',
    'getFirestoreProjectDb(target.projectId)',
    ".collection('ecosystem')",
    '.doc(target.ecosystemId)',
    'projectEcosystemDirectoryEntry',
  ]) {
    if (!fireuxDirectoryReader.includes(marker)) {
      violations.push(`FireUX directory reader must retain ${marker}.`)
    }
  }
  for (const marker of [
    'PLATFORM_DIRECTORY_TARGETS',
    'getFirestoreProjectDb(target.projectId, target.databaseId)',
    "db.collection('apps').get()",
    'Promise<App[]>',
  ]) {
    if (!fireuxAppsReader.includes(marker)) {
      violations.push(`FireUX Apps reader must retain ${marker}.`)
    }
  }
  for (const marker of [
    "NON_INDEXABLE_DIRECTORY_APP_IDS = new Set(['fireux-blank'])",
  ]) {
    if (!fireuxDirectoryPolicy.includes(marker)) {
      violations.push(`FireUX directory search policy must retain ${marker}.`)
    }
  }
  for (const [projectId, ecosystemId] of [
    ['bringli-b0517', 'bringli'],
    ['buenohost-ecosystem', 'buenohost'],
    ['cleanbox-f15bc', 'cleanbox'],
    ['fireux-2005', 'fireux'],
    ['granite-ecosystem', 'granite'],
    ['misebox-78f9c', 'misebox'],
    ['slap-45389', 'slap'],
  ]) {
    if (
      !fireuxDirectoryTargets.includes(`projectId: '${projectId}'`) ||
      !fireuxDirectoryTargets.includes(`ecosystemId: '${ecosystemId}'`)
    ) {
      violations.push(
        `FireUX platform directory targets must retain ${projectId}/${ecosystemId}.`
      )
    }
  }
  if (!fireuxDirectoryTargets.includes("detailPath: '/ecosystems/werkbox'")) {
    violations.push(
      'FireUX platform directory must route the stored Cleanbox ecosystem identity to the Werkbox product page.'
    )
  }
  for (const marker of [
    'isDirectoryAppIndexable',
    'isDirectoryEcosystemIndexable',
    'setSitemapResponseHeaders(event)',
  ]) {
    if (!fireuxDirectorySitemap.includes(marker)) {
      violations.push(`FireUX directory sitemap must retain ${marker}.`)
    }
  }
  for (const marker of [
    'isDirectoryAppIndexable',
    'ecosystem.value.name',
    "isIndexable.value ? 'index, follow' : 'noindex, nofollow'",
  ]) {
    if (!fireuxAppDetail.includes(marker)) {
      violations.push(`FireUX App relationship detail must retain ${marker}.`)
    }
  }

  const fireuxMiseboxProfile = read(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/runtime/content/ecosystem-profile.ts'
  )
  const fireuxMiseboxPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/ecosystems/misebox/explore.vue'
  )
  const fireuxMiseboxRedirect = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/misebox.vue'
  )
  for (const marker of [
    "websiteUrl: 'https://misebox.app'",
    "'digital-restaurant-menu'",
    "'restaurant-menu-management'",
  ]) {
    if (!fireuxMiseboxProfile.includes(marker)) {
      violations.push(
        `Misebox Ecosystem literature must retain its source-backed relationship marker: ${marker}.`
      )
    }
  }
  for (const marker of [
    "path: '/ecosystems/misebox/explore'",
    'buildPublicPageJsonLd({',
    "entry.status === 'active'",
    "entry.ecosystem_id === 'misebox'",
    "solution.status === 'live'",
    'miseboxEcosystemProfile',
  ]) {
    if (!fireuxMiseboxPage.includes(marker)) {
      violations.push(`FireUX Misebox relationship page must retain ${marker}.`)
    }
  }
  for (const marker of [
    "navigateTo('/ecosystems/misebox'",
    'redirectCode: 301',
  ]) {
    if (!fireuxMiseboxRedirect.includes(marker)) {
      violations.push(`Legacy /misebox redirect must retain ${marker}.`)
    }
  }

  for (const relative of DOCUMENT_ID_MODULES) {
    const source = read(repoRoot, relative)
    if (!source.includes("routeIdentity: 'document-id'")) {
      violations.push(`${relative} must declare document-id sitemap identity.`)
    }
    if (/slugField:\s*['"]id['"]/.test(source)) {
      violations.push(
        `${relative} must not treat a stored id field as route identity.`
      )
    }
  }

  const interlakenConfig = read(
    repoRoot,
    'projects/misebox/interlaken-essen/nuxt.config.ts'
  )
  if (!interlakenConfig.includes("'/mis/**'")) {
    violations.push('Interlaken private /mis routes must be noindex.')
  }

  const projectRobots = join(
    repoRoot,
    'projects/misebox/misebox-app/public/robots.txt'
  )
  if (existsSync(projectRobots)) {
    violations.push(
      'Misebox must use the Core-owned runtime robots.txt handler.'
    )
  }

  const jobsModule = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/module.ts'
  )
  const jobsServerConfig = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/config/module/server-config.ts'
  )
  const jobsApi = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/server/api/jobs.get.ts'
  )
  const jobsIndex = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/job/server/index/read.ts'
  )
  const jobsSitemap = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/server/sitemaps/jobs.xml.get.ts'
  )

  if (!jobsModule.includes("ctx.addDocument('/sitemaps/jobs.xml')")) {
    violations.push(
      'Jobs must contribute its projection-backed sitemap document.'
    )
  }
  if (!jobsServerConfig.includes("route: '/sitemaps/jobs.xml'")) {
    violations.push('Jobs must register its sitemap XML handler.')
  }
  for (const source of [jobsApi, jobsSitemap]) {
    if (!source.includes('readJobDirectoryPage')) {
      violations.push(
        'Jobs JSON and sitemap transport must share the bounded Directory reader.'
      )
      break
    }
  }
  for (const gate of [
    'readJobReadScope',
    'isJobDirectoryCandidate',
    'projectJobDirectoryEntry',
  ]) {
    if (!jobsIndex.includes(gate)) {
      violations.push(
        `Jobs sitemap reader must retain the ${gate} eligibility gate.`
      )
    }
  }
  if (jobsSitemap.includes("collection('jobs')")) {
    violations.push(
      'Jobs sitemap transport must not duplicate a raw root query.'
    )
  }

  const kitchensModule = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/module.ts'
  )
  const kitchensServerConfig = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/config/module/server-config.ts'
  )
  const kitchensApi = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/kitchens/index.get.ts'
  )
  const kitchensIndex = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/read.ts'
  )
  const kitchensSitemap = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/sitemaps/kitchens.xml.get.ts'
  )

  if (!kitchensModule.includes("ctx.addDocument('/sitemaps/kitchens.xml')")) {
    violations.push(
      'Kitchens must contribute its projection-backed sitemap document.'
    )
  }
  if (kitchensModule.includes("entityKey: 'kitchens'")) {
    violations.push(
      'Kitchens must not use the visibility-only generic sitemap provider.'
    )
  }
  if (!kitchensServerConfig.includes("route: '/sitemaps/kitchens.xml'")) {
    violations.push('Kitchens must register its sitemap XML handler.')
  }
  if (!kitchensSitemap.includes('readKitchens')) {
    violations.push('Kitchen sitemap must use the bounded Kitchen reader.')
  }
  if (!kitchensApi.includes('readKitchens')) {
    violations.push(
      'Kitchen collection transport must delegate to its Kitchen reader.'
    )
  }
  for (const gate of ['readKitchenRelatedRecords', 'resolveKitchen']) {
    if (!kitchensIndex.includes(gate)) {
      violations.push(
        `Kitchen reader must retain the ${gate} read gate.`
      )
    }
  }
  if (kitchensSitemap.includes("collection('kitchens')")) {
    violations.push(
      'Kitchen sitemap transport must not duplicate a raw root query.'
    )
  }

  const fireuxLanding = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/index.vue'
  )
  const miseboxLanding = read(
    repoRoot,
    'projects/misebox/misebox-app/app/pages/index.vue'
  )
  const interlakenLanding = read(
    repoRoot,
    'projects/misebox/interlaken-essen/app/pages/index.vue'
  )
  const smoke = read(repoRoot, 'scripts/_lib/smoke.mjs')
  const smokeContracts = read(repoRoot, 'scripts/_lib/app-smoke-contracts.mjs')
  const appRegistry = read(repoRoot, 'scripts/_lib/app-registry.mjs')

  if (!fireuxLanding.includes('useAppLandingSeo({')) {
    violations.push('FireUX landing must prove the shared App SEO seam.')
  }
  if (fireuxLanding.includes('useSeoMeta({')) {
    violations.push('FireUX landing must not bypass the shared App SEO seam.')
  }
  if (!miseboxLanding.includes('useAppLandingSeo({')) {
    violations.push('Misebox landing must prove the shared App SEO seam.')
  }
  if (miseboxLanding.includes('useSeoMeta({')) {
    violations.push('Misebox landing must not bypass the shared App SEO seam.')
  }
  if (!interlakenLanding.includes('useAppLandingSeo({')) {
    violations.push('Interlaken landing must prove the shared App SEO seam.')
  }
  if (interlakenLanding.includes('useSeoMeta({')) {
    violations.push(
      'Interlaken landing must not bypass the shared App SEO seam.'
    )
  }
  if (!interlakenLanding.includes('language: locale')) {
    violations.push('Interlaken landing must project its reviewed locale.')
  }
  if (!smoke.includes('renderedSeoFailures(contract.seo, body)')) {
    violations.push('HTTP smoke must verify rendered SEO outcomes.')
  }
  if (!smokeContracts.includes('const seoPageContract =')) {
    violations.push('App smoke contracts must expose a rendered SEO contract.')
  }
  if (
    !appRegistry.includes("jsonLdTypes: ['Organization', 'WebSite', 'WebPage']")
  ) {
    violations.push('FireUX smoke must prove the connected landing graph.')
  }
  for (const marker of [
    'Misebox — Menu and kitchen management',
    "canonical: 'https://interlaken-essen.misebox.app/'",
    `jsonLdIncludes: ['"inLanguage":"gsw-CH"']`,
  ]) {
    if (!appRegistry.includes(marker)) {
      violations.push(
        `App registry must retain rendered SEO evidence for ${marker}.`
      )
    }
  }
  for (const marker of [
    "seoPageContract('/operations', {",
    "seoPageContract('/operations/identity', {",
    "seoPageContract('/solutions', {",
    "seoPageContract('/solutions/app-for-small-business', {",
    "jsonLdTypes: ['CollectionPage', 'ItemList']",
    "route: '/sitemaps/static.xml'",
    "route: '/solutions/cleaning'",
    'noindex: true',
    "route: '/solutions/restaurant-menu-management'",
    "location: 'https://misebox.app/solutions/restaurant-menu-management'",
    "seoPageContract('/ecosystems/misebox', {",
    "canonical: 'http://localhost:3000/ecosystems/misebox'",
    "seoPageContract('/apps', {",
    "seoPageContract('/apps/misebox-app', {",
    "route: '/sitemaps/directory.xml'",
    "'<loc>http://localhost:3000/apps/misebox-app</loc>'",
    "'<loc>http://localhost:3000/sitemaps/directory.xml</loc>'",
    "route: '/apps/fireux-blank'",
    "route: '/misebox'",
    "location: '/ecosystems/misebox'",
    "route: '/ecosystems/cleanbox'",
    "location: '/ecosystems/werkbox'",
  ]) {
    if (!appRegistry.includes(marker)) {
      violations.push(`FireUX hub/detail smoke must retain ${marker}.`)
    }
  }

  if (violations.length) {
    throw new Error(`SEO spine drift:\n- ${violations.join('\n- ')}`)
  }

  console.log('[guard] ✅ SEO spine valid')
}
