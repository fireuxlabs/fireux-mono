import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
const source = readFileSync(
  new URL('../runtime/portfolio/server/index/read.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function harness(records) {
  const calls = []
  const query = {
    orderBy() {
      return this
    },
    limit() {
      return this
    },
    startAfter(id) {
      calls.push(id)
      return this
    },
    get: async () => ({
      docs: records.map(([id, data]) => ({ id, data: () => data })),
      size: records.length,
    }),
    doc(id) {
      const match = records.find((v) => v[0] === id)
      return {
        get: async () => ({ exists: !!match, id, data: () => match?.[1] }),
      }
    },
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)};return {readPortfolioDirectoryPage,readPortfolioDetail}`,
    [
      'FieldPath',
      'createError',
      'getRuntimeFirestore',
      'isFirestoreDocumentId',
      'PortfolioStorage',
    ]
  )(
    { documentId: () => 'id' },
    (v) => Object.assign(new Error(v.statusMessage), v),
    () => ({ collection: () => query }),
    (v) => typeof v === 'string' && !!v && !v.includes('/'),
    { rootCollection: 'portfolios' }
  )
  return { ...api, calls }
}
const fixture = {
  identity: {
    slug: 'a', name: 'Public name', tagline: 'Public tagline',
    image_url: 'https://example.test/image.jpg', region_label: 'Bern', status: 'active',
    notes: 'INTERNAL NOTES', owner_label: 'INTERNAL OWNER', strategy_label: 'INTERNAL STRATEGY',
  },
  management: { mode: 'root' }, created: { by: 'ACTOR' }, updated: { by: 'ACTOR' },
}
test('directory and detail return only public Identity, independent of management metadata', async () => {
  const api = harness([['a', fixture]])
  const directory = await api.readPortfolioDirectoryPage(),
    detail = await api.readPortfolioDetail('a')
  const expected = {
    id: 'a',
    identity: {
    slug: 'a',
    name: 'Public name',
    tagline: 'Public tagline',
    image_url: 'https://example.test/image.jpg',
    region_label: 'Bern',
    status: 'active',
    },
  }
  assert.deepEqual(directory.items, [expected])
  assert.deepEqual(detail.portfolio, expected)
  assert.doesNotMatch(
    JSON.stringify([directory, detail]),
    /INTERNAL|ACTOR|management|created|updated/
  )
  const withoutPrivate = harness([['a', expected]])
  assert.deepEqual((await withoutPrivate.readPortfolioDirectoryPage()).items, [
    expected,
  ])
})
test('inactive records and records without explicit active status do not enter public Identity', async () => {
  const api = harness([
    ['a', { identity: {status: 'archived', notes: 'Secret'} }],
    ['b', { identity: {name: 'Unknown', slug: 'b'} }],
  ])
  assert.deepEqual((await api.readPortfolioDirectoryPage()).items, [])
  await assert.rejects(api.readPortfolioDetail('a'), { statusCode: 404 })
})
test('malformed active public summaries fail explicitly and invalid cursors are rejected', async () => {
  for (const record of [
    { ...fixture, identity: {...fixture.identity, name: ''} },
    { ...fixture, identity: {...fixture.identity, slug: 'different'} },
    { ...fixture, identity: {...fixture.identity, image_url: 4} },
  ]) {
    const api = harness([['a', record]])
    await assert.rejects(api.readPortfolioDirectoryPage(), { statusCode: 500 })
  }
  await assert.rejects(harness([]).readPortfolioDirectoryPage('!'), {
    statusCode: 400,
  })
})

test('public SEO never falls back to internal notes or strategy', () => {
  const code = readFileSync(
    new URL(
      '../runtime/portfolio/composables/usePortfolioSeo.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const build = compileFunction(
    `${stripTypeScriptTypes(code)};return buildPortfolioJsonLd`
  )()
  const result = build({ id: 'a', ...fixture, identity: {...fixture.identity, tagline: ''} })
  assert.equal(result.description, '')
  assert.doesNotMatch(JSON.stringify(result), /INTERNAL/)
})
test('public pagination retains the bounded cursor contract', async () => {
  const records = Array.from({ length: 25 }, (_, i) => {
    const id = `p${i}`
    return [id, { ...fixture, identity: {...fixture.identity, slug: id} }]
  })
  const response = await harness(records).readPortfolioDirectoryPage()
  assert.equal(response.items.length, 24)
  assert.equal(
    Buffer.from(response.nextCursor, 'base64url').toString('utf8'),
    'p23'
  )
})
