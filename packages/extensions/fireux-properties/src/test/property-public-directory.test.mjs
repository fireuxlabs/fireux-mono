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
    (value) => Object.assign(Error(value.statusMessage), value)
  )
}
const identity = {
  name: 'A home',
  slug: 'home',
  status: 'active',
  publication_state: 'published',
  unit_count: 1,
  property_type: 'residential',
}
test('Unpublished/inactive records and retired root publication fields do not enter the public directory', () => {
  for (const data of [
    {
      status: 'active',
      publication_state: 'published',
      slug: 'home',
      identity: { name: 'Old shape' },
    },
    { identity: { ...identity, publication_state: 'draft' } },
    { identity: { ...identity, status: 'inactive' } },
    { identity: { guest_notes: 'private' } },
  ])
    assert.equal(project({ id: 'private', data }), null)
})
test('Malformed published identity remains a source error rather than an empty directory', () => {
  for (const patch of [
    { slug: '' },
    { name: '' },
    { unit_count: -1 },
    { unit_count: '1' },
    { unit_count: Number.MAX_SAFE_INTEGER + 1 },
    { property_type: 'unknown' },
  ]) {
    assert.throws(
      () =>
        project({ id: 'bad', data: { identity: { ...identity, ...patch } } }),
      /Property directory source is invalid/
    )
  }
})
test('Published identity mirrors without valuation, private support or management prerequisites', () => {
  const data = {
    identity,
    valuation: { estimated_value: 999, currency_code: 'CHF' },
    legacy_manual: { wifi_password: 'secret' },
    management: 'malformed',
  }
  assert.deepEqual(project({ id: 'public', data }), {
    id: 'public',
    slug: 'home',
    name: 'A home',
    property_type: 'residential',
    unit_count: 1,
  })
  data.valuation = { estimated_value: 'invalid financial data' }
  assert.equal(project({ id: 'public', data }).name, 'A home')
})
