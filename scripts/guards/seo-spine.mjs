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

  for (const route of ['/dashboard/**', '/account/**', '/member/**']) {
    if (!config.includes(`'${route}'`)) {
      violations.push(`Core noindex defaults must include ${route}.`)
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
    'packages/extensions/fireux-jobs/src/runtime/server/api/public/jobs.get.ts'
  )
  const jobsIndex = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/server/job/public-index.ts'
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
    if (!source.includes('readPublicJobIndexPage')) {
      violations.push(
        'Jobs JSON and sitemap transport must share the bounded public index reader.'
      )
      break
    }
  }
  for (const gate of [
    'readPublicJobRuntimeScope',
    'isPublicJobCandidate',
    'projectPublicJob',
  ]) {
    if (!jobsIndex.includes(gate)) {
      violations.push(
        `Jobs sitemap reader must retain the ${gate} public gate.`
      )
    }
  }
  if (jobsSitemap.includes("collection('jobs')")) {
    violations.push(
      'Jobs sitemap transport must not duplicate a raw root query.'
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

  if (violations.length) {
    throw new Error(`SEO spine drift:\n- ${violations.join('\n- ')}`)
  }

  console.log('[guard] ✅ SEO spine valid')
}
