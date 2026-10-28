import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  readSitemapPublicFilters,
  matchesSitemapPublicFilters,
} from '../utils/sitemap-public-filters.ts'
function load(file, result, deps = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export(?: type)? \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.dev/g, 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const normalize = load('../config/app/seo.ts', 'normalizeSitemapEntity', {
  readSitemapPublicFilters,
})
const supplierModule = readFileSync(
  new URL(
    '../../../../extensions/fireux-suppliers/src/module.ts',
    import.meta.url
  ),
  'utf8'
)
const registration = compileFunction(
  'return ' + supplierModule.match(/ctx\.addEntity\((\{[\s\S]*?\})\)/)[1]
)()
const entity = normalize(registration)
test('Supplier sitemap registration preserves both directory publication conditions through configuration', () => {
  assert.equal(entity.publicField, 'identity.status')
  assert.equal(entity.publicValue, 'active')
  assert.deepEqual(entity.additionalPublicFilters, [
    { field: 'identity.visibility', value: true },
  ])
  assert.deepEqual(
    normalize({
      entityKey: 'places',
      canonicalCollectionPath: 'places',
      publicField: 'status',
      publicValue: 'active',
    }).additionalPublicFilters,
    []
  )
})
test('Malformed or duplicate public filters fail closed instead of removing publication policy', () => {
  for (const value of [
    null,
    {},
    [{ field: 'identity.visibility', value: undefined }],
    [{ field: 'identity.visibility', value: NaN }],
    [{ field: 'bad/path', value: true }],
    [{ field: 'status', value: 'active', extra: true }],
    [
      { field: 'status', value: 'active' },
      { field: 'status', value: 'inactive' },
    ],
  ]) {
    assert.throws(
      () => readSitemapPublicFilters(value),
      /Sitemap public filter/
    )
  }
  assert.equal(
    matchesSitemapPublicFilters(
      { identity: { visibility: false } },
      entity.additionalPublicFilters
    ),
    false
  )
  assert.equal(
    matchesSitemapPublicFilters({}, entity.additionalPublicFilters),
    false
  )
})
test('Sitemap counts and page query share every public condition; hidden and inactive Suppliers are excluded', async () => {
  const rows = [
    { id: 'visible', identity: { status: 'active', visibility: true } },
    { id: 'hidden', identity: { status: 'active', visibility: false } },
    { id: 'inactive', identity: { status: 'inactive', visibility: true } },
    { id: 'missing', identity: { status: 'active' } },
  ]
  const queries = []
  const runtime = load(
    '../runtime/server/utils/seo-sitemaps.ts',
    '({toEntityList,isCanonicalDocPublic,countPublicCanonicalDocs,fetchCanonicalEntitySitemapPage})',
    {
      readSitemapPublicFilters,
      matchesSitemapPublicFilters,
      normalizeSlug: (value) => String(value ?? '').trim(),
      isFirestoreDocumentId: (value) => Boolean(value) && !value.includes('/'),
      getRuntimeFirestore: () => ({
        collection: () => {
          const filters = [],
            query = {
              where: (field, operator, value) => {
                assert.equal(operator, '==')
                filters.push({ field, value })
                return query
              },
              count: () => ({
                get: async () => ({
                  data: () => ({
                    count: rows.filter((row) =>
                      matchesSitemapPublicFilters(row, filters)
                    ).length,
                  }),
                }),
              }),
              orderBy: () => query,
              offset: () => query,
              limit: () => query,
              get: async () => ({
                docs: rows
                  .filter((row) => matchesSitemapPublicFilters(row, filters))
                  .map((row) => ({ id: row.id, data: () => row })),
              }),
            }
          queries.push(filters)
          return query
        },
      }),
    }
  )
  const parsed = runtime.toEntityList([entity])[0]
  assert.deepEqual(
    parsed.additionalPublicFilters,
    entity.additionalPublicFilters
  )
  assert.equal(runtime.isCanonicalDocPublic(parsed, rows[1], 'hidden'), false)
  assert.equal(runtime.isCanonicalDocPublic(parsed, rows[2], 'inactive'), false)
  assert.equal(await runtime.countPublicCanonicalDocs(parsed), 1)
  assert.deepEqual(
    (await runtime.fetchCanonicalEntitySitemapPage(parsed, 1)).map(
      (item) => item.path
    ),
    ['/suppliers/visible']
  )
  assert.equal(queries.length, 2)
  for (const filters of queries)
    assert.deepEqual(filters, [
      { field: 'identity.status', value: 'active' },
      { field: 'identity.visibility', value: true },
    ])
})
