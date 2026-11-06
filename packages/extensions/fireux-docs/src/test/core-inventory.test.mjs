import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { coreInventory } from '../catalogue/core-inventory.mjs'

const runtime = fileURLToPath(
  new URL('../../../../core/fireux-core/src/runtime/', import.meta.url)
)
const preview = readFileSync(
  new URL('../runtime/components/CorePreview.vue', import.meta.url),
  'utf8'
)

test('Core inventory covers every component source once, including connected owners', () => {
  const inventory = coreInventory(runtime)
  const files = readdirSync(runtime, { recursive: true }).filter((path) =>
    /(^|\/)components\/.+\.vue$/.test(path)
  )
  assert.deepEqual(
    new Set(inventory.map((entry) => entry.source)),
    new Set(files)
  )
  assert.equal(new Set(inventory.map((entry) => entry.id)).size, files.length)
  assert.deepEqual(
    new Set(inventory.map((entry) => entry.scope)),
    new Set(['Shared', 'App', 'Ecosystem', 'User', 'Workspace'])
  )
})

test('Nuxt registration supplies names and source remains inspectable when overridden', () => {
  const path = `${runtime}components/molecules/State.vue`
  const inventory = coreInventory(
    runtime,
    [{ filePath: path, pascalName: 'FireState' }],
    preview
  )
  const state = inventory.find((entry) => entry.name === 'FireState')
  assert.equal(state.registered, true)
  assert.equal(state.preview, true)
  assert.match(state.code, /defineProps/)
  assert.equal(
    inventory.find((entry) => entry.source === 'app/components/Shell.vue')
      .registered,
    false
  )
})

test('Every preview names a real Core component; connected components are not auto-mounted', () => {
  const inventory = coreInventory(runtime, [], preview)
  const examples = [...preview.matchAll(/name === '([^']+)'/g)].map(
    (match) => match[1]
  )
  assert.equal(new Set(examples).size, examples.length)
  for (const name of examples)
    assert.ok(
      inventory.some((entry) => entry.name === name),
      name
    )
  assert.equal(
    inventory.find((entry) => entry.source === 'components/Auth/System.vue')
      .preview,
    false
  )
})
