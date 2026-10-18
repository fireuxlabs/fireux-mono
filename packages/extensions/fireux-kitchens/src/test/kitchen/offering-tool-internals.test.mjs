import {
  serviceMenuPolicy,
  offeringOverviewPolicy,
  serviceOverviewProjection,
} from '../offering-test-helpers.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as vue from 'vue'

function load(path, names, deps, component = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (component)
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys({
      ...serviceMenuPolicy,
      ...offeringOverviewPolicy,
      ...serviceOverviewProjection,
      useWorkspacePageState: () => ({ publish() {} }),
      ...deps,
    })
  )(
    ...Object.values({
      ...serviceMenuPolicy,
      ...offeringOverviewPolicy,
      ...serviceOverviewProjection,
      useWorkspacePageState: () => ({ publish() {} }),
      ...deps,
    })
  )
}
const base = '../../runtime/kitchen/components/'
const { useCommandScope } = load(
  '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  vue
)
test('Collection and Delivery overview include all matching services and publish page context', () => {
  const published = []
  const scope = vue.effectScope()
  const offerings = vue.ref([
    {
      id: 'main',
      name: 'Main',
      enabled: true,
      menu_ids: ['food'],
      interactions: [{ type: 'collection', enabled: true }],
    },
    {
      id: 'concept',
      name: 'Weekend bags',
      separate: true,
      enabled: true,
      menu_ids: ['bags'],
      collection_timing: 'next_day',
      interactions: [{ type: 'collection', enabled: true }],
    },
    {
      id: 'off',
      name: 'Office lunch',
      separate: true,
      enabled: false,
      menu_ids: ['lunch'],
      interactions: [
        { type: 'collection', enabled: true },
        { type: 'delivery', enabled: true },
      ],
    },
    {
      id: 'delivery',
      name: 'Main delivery',
      enabled: true,
      menu_ids: ['food'],
      interactions: [{ type: 'delivery', enabled: true }],
    },
  ])
  const state = scope.run(() =>
    load(
      base + 'Workspace/Offerings/Index.vue',
      'entries',
      {
        ...vue,
        useWorkspacePageState: () => ({
          publish: (value) => published.push(value),
        }),
        useKitchenOfferings: () => ({
          offerings,
          ownerScope: vue.ref(0),
          kitchenId: vue.ref('k'),
          outcome: vue.ref('ready'),
          canWrite: vue.ref(true),
          menus: vue.ref([
            { id: 'food', name: 'Food' },
            { id: 'bags', name: 'Packed lunches' },
            { id: 'lunch', name: 'Lunch' },
          ]),
          menusOutcome: vue.ref('ready'),
        }),
      },
      true
    )
  )
  const collection = state.entries.value.find(
    (row) => row.option.key === 'collection'
  )
  const delivery = state.entries.value.find(
    (row) => row.option.key === 'delivery'
  )
  const before = JSON.stringify(offerings.value)
  for (const timing of ['next_day', 'same_day', 'next_day']) {
    offerings.value[1].collection_timing = timing
    assert.deepEqual(
      state.entries.value
        .find((row) => row.option.key === 'collection')
        .offerings.map((row) => row.id),
      ['main', 'concept', 'off']
    )
    assert.deepEqual(
      state.entries.value
        .find((row) => row.option.key === 'delivery')
        .offerings.map((row) => row.id),
      ['off', 'delivery']
    )
  }
  assert.equal(JSON.stringify(offerings.value), before)
  assert.equal(published.at(-1).selected.kitchenId, 'k')
  assert.equal(published.at(-1).services.length, 7)
  scope.stop()
  assert.equal(published.at(-1).derived.outcome, 'idle')
})

test('Configure and service editor use the same menu choices and readiness', () => {
  const menus = [
    { id: 'food', name: 'Food', status: 'published', format: 'interactive' },
    { id: 'draft', name: 'Draft', status: 'draft', format: 'interactive' },
    {
      id: 'daily',
      name: 'Daily specials',
      status: 'published',
      format: 'interactive',
      schedule: 'daily',
    },
    {
      id: 'document',
      name: 'Document',
      status: 'published',
      format: 'document',
    },
    {
      id: 'archived',
      name: 'Archived',
      status: 'archived',
      format: 'interactive',
    },
  ]
  assert.deepEqual(
    serviceMenuPolicy.serviceMenuOptions(menus).map((row) => row.value),
    ['food', 'draft']
  )
  assert.equal(
    serviceMenuPolicy.serviceMenuReadiness(['daily'], menus).validSelection,
    false
  )
  assert.equal(
    serviceMenuPolicy.serviceMenuReadiness(['draft'], menus).hasPublishedMenu,
    false
  )
  const source = readFileSync(
    new URL(base + 'Workspace/Offerings/Single.vue', import.meta.url),
    'utf8'
  )
  assert.match(source, /WorkspaceKitchenOfferingsService/)
  assert.doesNotMatch(source, /updateOffering|saveInteraction|interactionType/)
})

test('the direct service page resolves the same service editors for its exact record', () => {
  const scope = vue.effectScope()
  const selectedId = vue.ref('main')
  const records = vue.ref([
    { id: 'main', interactions: [{ type: 'collection', enabled: true }] },
    { id: 'other', interactions: [{ type: 'delivery', enabled: true }] },
  ])
  const state = scope.run(() =>
    load(
      base + 'Workspace/Offerings/Single.vue',
      'offering,options',
      {
        ...vue,
        useRouteParam: () => selectedId,
        useKitchenOfferings: () => ({ offerings: records }),
      },
      true
    )
  )
  assert.equal(state.offering.value.id, 'main')
  assert.deepEqual(
    state.options.value.map((row) => row.key),
    ['collection']
  )
  selectedId.value = 'other'
  assert.equal(state.offering.value.id, 'other')
  assert.deepEqual(
    state.options.value.map((row) => row.key),
    ['delivery']
  )
  selectedId.value = 'missing'
  assert.equal(state.offering.value, undefined)
  assert.deepEqual(state.options.value, [])
  scope.stop()
})

test('the client configure URL has one matching native Services endpoint', () => {
  const adapter = readFileSync(
    new URL(
      '../../runtime/kitchen/composables/offerings/useKitchenOfferings.ts',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(adapter, /\/api\/workspace\/kitchen\/services\//)
  const endpoint = readFileSync(
    new URL(
      '../../runtime/server/api/workspace/kitchen/services/configure.post.ts',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(endpoint, /configureKitchenOffering/)
})
