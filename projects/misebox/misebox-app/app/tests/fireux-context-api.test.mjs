import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL('../../server/fireux/context/product.ts', import.meta.url),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace(/^export /gm, '')
const read = compileFunction(
  `${stripTypeScriptTypes(source)};return readFireuxProductContext`,
  ['createHash']
)(createHash)
test('published context is readable without identity, project, or database access', () => {
  const result = read()
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.visibility, 'public')
  assert.equal(result.context.reviewStatus, 'reviewed')
  assert.equal(result.appId, 'misebox-app')
  assert.match(result.revision, /^[a-f0-9]{64}$/)
  assert.equal(result.fireuxSharing, undefined)
})
test('callers cannot mutate the published source', () => {
  const first = read()
  first.context.summary = 'changed'
  assert.notEqual(read().context.summary, 'changed')
})

test('App publishes its identity without exposing a mutable source object', () => {
  const first = read()
  assert.equal(first.identity.name, 'Misebox')
  assert.equal(first.identity.imageUrl, 'https://misebox.app/img/app/logo.png')
  first.identity.description = 'Changed by consumer'
  assert.notEqual(read().identity.description, first.identity.description)
  assert.equal(read().revision, first.revision)
})
