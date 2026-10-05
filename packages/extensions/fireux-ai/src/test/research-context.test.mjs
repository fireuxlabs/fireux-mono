import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const root = new URL('../../../../../', import.meta.url)
const source = (path) => readFileSync(new URL(path, root), 'utf8')
function load(text, dependencies, name) {
  const code = stripTypeScriptTypes(
    text.replace(/^import.*\n/gm, '').replace(/^export /gm, '')
  )
  return compileFunction(
    `${code}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const methodPath =
  'packages/extensions/fireux-ai/src/runtime/utils/industry-research-context.ts'
const read = load(source(methodPath), {}, 'readIndustryResearchContext')
test('research context is fresh, serializable, advisory and industry-independent', () => {
  const original = read()
  const changed = read()
  changed.steps[0].instruction = 'changed'
  changed.inputs.push('changed')
  assert.deepEqual(read(), original)
  assert.deepEqual(JSON.parse(JSON.stringify(original)), original)
  assert.deepEqual(
    original.steps.map((s) => s.id),
    ['scope', 'evidence', 'jobs', 'tools', 'capabilities', 'reconcile', 'proof']
  )
  assert.match(original.instruction, /Use only supplied evidence/)
  assert.match(original.instruction, /URL without accessible content/)
  assert.match(original.instruction, /Never invent interviews/)
  assert.match(original.instruction, /implementation readiness independent/)
  assert.match(original.instruction, /not-assessed/)
  assert.match(
    original.instruction,
    /verified only for named acceptance evidence/
  )
  assert.match(original.instruction, /grants no execution authority/)
  assert.ok(!source(methodPath).includes('fetch('))
  assert.ok(!source(methodPath).includes('readFile'))
})
test('public research endpoint serves the same source and stable content revision', () => {
  const text = source(
    'projects/fireux/fireux-app/server/api/fireux/context/research.get.ts'
  ).replace('export default', 'const handler =')
  const headers = {}
  const handler = load(
    text,
    {
      createHash,
      defineEventHandler: (fn) => fn,
      setResponseHeader: (_, key, value) => (headers[key] = value),
      readIndustryResearchContext: read,
    },
    'handler'
  )
  const result = handler({})
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.visibility, 'public')
  assert.equal(result.contextId, 'industry-capability-research')
  assert.equal(result.sourcePath, read().consumption.endpoint)
  assert.deepEqual(result.context, read())
  assert.equal(
    result.revision,
    createHash('sha256').update(JSON.stringify(read())).digest('hex')
  )
  assert.equal(headers['cache-control'], 'public, max-age=300')
})
test('owning guide is routed and its current-source links resolve', () => {
  const path = 'packages/extensions/fireux-ai/docs/ai/research-context.md'
  const guide = source(path)
  assert.ok(source('AGENTS.md').includes(path))
  for (const field of [
    'Purpose and inheritance',
    'Scope and ownership',
    'Authority',
    'Refresh and verification',
    'Living-context maintenance',
  ])
    assert.ok(guide.includes(field), field)
  for (const [, target] of guide.matchAll(/\]\(([^)]+)\)/g)) {
    if (!target.startsWith('http'))
      assert.ok(existsSync(new URL(target, new URL(path, root))), target)
  }
  assert.match(
    guide,
    /automated browsing, research generation and saving are separate/
  )
  assert.ok(
    source(
      'projects/fireux/fireux-app/app/pages/context/research.vue'
    ).includes('readIndustryResearchContext')
  )
  assert.ok(
    source('projects/fireux/fireux-app/app/pages/context/index.vue').includes(
      'to="/context/research"'
    )
  )
  assert.equal(
    existsSync(
      new URL('projects/fireux/fireux-app/app/pages/context.vue', root)
    ),
    false
  )
})
