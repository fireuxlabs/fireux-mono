import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/property/server/index/read.ts', import.meta.url),
  'utf8'
)
const code = stripTypeScriptTypes(
  source.slice(
    source.indexOf('const text ='),
    source.indexOf('export async function readPropertyDirectoryPage')
  )
)
function project(document) {
  return compileFunction(code + '\nreturn propertyDirectoryEntry(document)', [
    'document',
    'isFirestoreDocumentId',
    'createError',
  ])(
    document,
    (id) => typeof id === 'string' && Boolean(id) && !id.includes('/'),
    (input) => Object.assign(new Error(input.statusMessage), input)
  )
}
test('unpublished legacy/private records never enter public projection', () => {
  assert.equal(
    project({
      id: 'private',
      data: { status: 'active', identity: { guest_notes: 'private' } },
    }),
    null
  )
})
test('malformed published summary fields remain a source error rather than an empty directory', () => {
  for (const overrides of [
    { slug: '' },
    { identity: { name: 'Missing fields' } },
    {
      identity: { name: 'Home', unit_count: -1, property_type: 'residential' },
    },
  ]) {
    assert.throws(
      () =>
        project({
          id: 'bad',
          data: {
            status: 'active',
            publication_state: 'published',
            slug: 'home',
            ...overrides,
          },
        }),
      /Property directory source is invalid/
    )
  }
})
test('public summary excludes operational and legacy fields and does not require private metadata', () => {
  const data = {
    slug: 'home',
    status: 'active',
    publication_state: 'published',
    identity: {
      name: 'A home',
      unit_count: 1,
      property_type: 'residential',
      estimated_value: 999,
    },
    legacy_manual: { wifi_password: 'secret' },
  }
  assert.deepEqual(project({ id: 'public', data }), {
    id: 'public',
    slug: 'home',
    name: 'A home',
    property_type: 'residential',
    unit_count: 1,
  })
})
