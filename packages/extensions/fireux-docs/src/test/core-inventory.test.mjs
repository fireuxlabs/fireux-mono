import { publicComponents } from 'fireux-core/catalogue/public-components'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { coreInventory, publicLibrary } from '../catalogue/core-inventory.mjs'

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
    new Set(['Shared', 'App', 'AppUser', 'Ecosystem', 'User', 'Workspace'])
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
    inventory.find((entry) => entry.source === 'app/components/FireuxApp.vue')
      .registered,
    false
  )
})

test('the internal User card family exposes Pill, Cell, Preview and Overview', () => {
  const cards = coreInventory(runtime)
    .filter((entry) => entry.source.startsWith('user/components/Cards/'))
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(cards, [
    'UserCardsCell',
    'UserCardsOverview',
    'UserCardsPill',
    'UserCardsPreview',
  ])
})

test('the internal App card family exposes Cell and Preview', () => {
  const cards = coreInventory(runtime)
    .filter((entry) => entry.source.startsWith('app/components/Cards/'))
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(cards, ['AppCardsCell', 'AppCardsPreview'])
})

test('the internal Ecosystem card family exposes Cell and Preview', () => {
  const cards = coreInventory(runtime)
    .filter((entry) => entry.source.startsWith('ecosystem/components/Cards/'))
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(cards, ['EcosystemCardsCell', 'EcosystemCardsPreview'])
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

test('public library contains only explicit entries with real source and safe previews', () => {
  const library = publicLibrary(runtime, [], preview)
  assert.equal(library.length, publicComponents.length)
  assert.equal(new Set(library.map((entry) => entry.name)).size, library.length)
  assert.equal(
    new Set(library.map((entry) => entry.source)).size,
    library.length
  )
  for (const entry of library) {
    assert.equal(entry.preview, true, entry.name)
    assert.ok(entry.description.trim(), entry.name)
    assert.equal(entry.scope, 'Shared', entry.name)
  }
  const internal = coreInventory(runtime, [], preview)
  assert.ok(
    internal.some((entry) => entry.name === 'FireLayoutsDashboardProfileButton')
  )
  assert.equal(
    library.some((entry) => entry.name === 'FireLayoutsDashboardProfileButton'),
    false
  )
  assert.equal(
    library.some((entry) => entry.name === 'FireAuthSystem'),
    false
  )
  assert.equal(
    library.some((entry) => entry.scope === 'App'),
    false
  )
  assert.throws(() => publicLibrary(runtime, [], ''), /needs a safe preview/)
  const source = library[0].source
  assert.throws(
    () =>
      publicLibrary(
        runtime,
        [{ filePath: `${runtime}${source}`, pascalName: 'Renamed' }],
        preview
      ),
    /source or registration changed/
  )
})
