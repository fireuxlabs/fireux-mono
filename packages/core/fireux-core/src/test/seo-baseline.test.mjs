import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, toValue } from 'vue'
import { readSitemapPublicFilters } from '../runtime/utils/sitemap-public-filters.ts'
import {
  resolveSeoRobots,
  matchesSeoPath,
  normalizeSeoPath,
} from '../utils/seoIndexing.ts'

function load(path, result, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export(?: type)? \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function fixture(seo = {}) {
  const runtime = {
    public: {
      fireux: { name: 'Bike Tours', siteUrl: 'https://bike.example', seo },
    },
  }
  const meta = [],
    head = []
  const api = load(
    '../runtime/composables/fireux/seo/useSeo.ts',
    '({useSeo, useAppLandingSeo})',
    {
      computed,
      toValue,
      resolveSeoRobots,
      useRuntimeConfig: () => runtime,
      useRequestURL: () => new URL('https://untrusted.example/'),
      useSeoMeta: (value) => meta.push(value),
      useHead: (value) => head.push(value),
    }
  )
  return { api, runtime, meta, head }
}

test('configured noindex wins over a page request to index, including deep and query paths', () => {
  assert.equal(
    resolveSeoRobots({
      path: '/tours/ride?ref=one',
      noindexPaths: ['/**'],
      robots: 'index, follow',
    }),
    'noindex, nofollow'
  )
  assert.equal(
    resolveSeoRobots({
      path: '/workspace/kitchen',
      noindexPaths: ['/workspace'],
    }),
    'noindex, nofollow'
  )
  assert.equal(
    resolveSeoRobots({ path: '/tours/ride', enabled: false }),
    'noindex, nofollow'
  )
  assert.equal(
    resolveSeoRobots({ path: '/', noindexPaths: ['/workspace/**'] }),
    'index, follow'
  )
  assert.equal(matchesSeoPath('/tours/ride', '/tours/*'), true)
  assert.equal(matchesSeoPath('/tours/ride/more', '/tours/*'), false)
})

test('landing emits one configured canonical, social previews and connected identity graph', () => {
  const f = fixture({ noindexPaths: ['/**'] })
  f.api.useAppLandingSeo({
    title: 'Private rides',
    description: 'Ride with a local guide.',
    image: '/img/app/thumbnail.png',
    logo: '/img/app/logo.png',
    language: 'en',
  })
  const meta = f.meta[0],
    head = f.head[0]()
  assert.equal(meta.robots(), 'noindex, nofollow')
  assert.equal(meta.ogUrl(), 'https://bike.example/')
  assert.equal(meta.ogImage(), 'https://bike.example/img/app/thumbnail.png')
  assert.equal(meta.ogType(), 'website')
  assert.equal(meta.twitterCard(), 'summary_large_image')
  assert.equal(meta.twitterTitle(), 'Private rides')
  assert.equal(meta.twitterImage(), meta.ogImage())
  assert.deepEqual(head.link, [
    { rel: 'canonical', href: 'https://bike.example/' },
  ])
  assert.deepEqual(
    JSON.parse(head.script[0].innerHTML)['@graph'].map((item) => item['@type']),
    ['Organization', 'WebSite', 'WebPage']
  )
})

test('runtime sitemap excludes explicit paths, root and dynamic families on a noindex prototype', () => {
  const read = load(
    '../runtime/server/utils/seo-sitemaps.ts',
    'readRuntimeSeoSitemaps',
    {
      resolveSeoRobots,
      readSitemapPublicFilters,
      useRuntimeConfig: () => ({
        public: {
          fireux: {
            siteUrl: 'https://bike.example',
            seo: {
              noindexPaths: ['/**'],
              sitemapPaths: ['/', '/tours/ride'],
              hubs: ['/blog'],
              sitemapEntities: [
                {
                  entityKey: 'users',
                  canonicalCollectionPath: 'users',
                  routePrefix: '/users',
                },
              ],
            },
          },
        },
      }),
    }
  )
  const result = read()
  assert.deepEqual(result.staticPaths, [])
  assert.deepEqual(result.entities, [])
})

test('App source description feeds the resolved SEO contract without requiring catalogue pages', () => {
  const resolve = load('../config/app/static-paths.ts', 'resolveSeoConfig')
  assert.equal(
    resolve(undefined, {
      seo: { description: 'Private guided cycling tours.' },
    }).defaultDescription,
    'Private guided cycling tours.'
  )
  assert.equal(
    resolve(
      { defaultDescription: 'Explicit operator copy.' },
      { seo: { description: 'Other copy.' } }
    ).defaultDescription,
    'Explicit operator copy.'
  )
})

test('declared static paths cannot bypass configured noindex headers and sitemap policy', async () => {
  const normalizers = load(
    '../config/app/seo-paths.ts',
    '({normalizePaths, normalizePatterns, normalizeSiteUrl})',
    { normalizePath: normalizeSeoPath, patternMatchesPath: matchesSeoPath }
  )
  const configure = load('../config/app/seo.ts', 'configureSeoDefaults', {
    ...normalizers,
    resolveSeoRobots,
    readSitemapPublicFilters,
  })
  const nuxt = { options: {}, callHook: async () => {} }
  const resolved = await configure(nuxt, {
    appName: 'Bike Tours',
    domain: 'https://bike.example',
    seo: { staticPaths: ['/tours/ride'], noindexPaths: ['/**'] },
  })
  assert.deepEqual(resolved.sitemapPaths, [])
  assert.equal(
    nuxt.options.routeRules['/**'].headers['X-Robots-Tag'],
    'noindex, nofollow'
  )
})

test('Core manifest uses the App description and versioned brand assets', () => {
  const handler = load(
    '../runtime/server/manifest.webmanifest.get.ts',
    'handler',
    {
      defineEventHandler: (value) => value,
      getQuery: () => ({}),
      getRequestURL: () => new URL('https://bike.example'),
      setHeader: () => {},
      withBuildVersion: (path, version) => `${path}?v=${version}`,
      brandAssets: {
        pwaIcon192: '/img/app/pwa/icon-192.png',
        pwaIcon512: '/img/app/pwa/icon-512.png',
      },
      useRuntimeConfig: () => ({
        app: { buildId: 'build-one' },
        public: {
          fireux: {
            name: 'Bike Tours',
            shortName: 'Bikes',
            seo: { defaultDescription: 'Private guided cycling tours.' },
          },
        },
      }),
    }
  )
  const manifest = handler({})
  assert.equal(manifest.description, 'Private guided cycling tours.')
  assert.equal(manifest.name, 'Bike Tours')
  assert.equal(manifest.icons[0].src, '/img/app/pwa/icon-192.png?v=build-one')
})

test('Firebase Hosting receives Core robots policy without invoking the reserved function route', () => {
  const configure = load('../config/app/nitro.ts', 'configNitroFirebase', {
    process: { env: { NODE_ENV: 'production' } },
  })
  const config = { nitro: { prerender: { routes: ['/existing'] } } }
  configure(config, { serverFunctionName: 'bikeTours', region: 'europe-west1' })
  assert.deepEqual(config.nitro.prerender.routes, ['/existing', '/robots.txt'])
  assert.equal(config.nitro.prerender.failOnError, true)

  const handler = load('../runtime/server/robots.txt.get.ts', 'handler', {
    defineEventHandler: (value) => value,
    setHeader: () => {},
    useRuntimeConfig: () => ({
      public: {
        fireux: { seo: { siteUrl: 'https://bike.example', disallow: ['/'] } },
      },
    }),
  })
  assert.equal(
    handler({}),
    'User-agent: *\nDisallow: /\nSitemap: https://bike.example/sitemap.xml\n'
  )
})
