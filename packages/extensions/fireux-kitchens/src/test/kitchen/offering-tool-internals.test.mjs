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
import { renderToString } from 'vue/server-renderer'
import { parse } from 'vue/compiler-sfc'

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
const deferred = () => {
  let resolve
  const promise = new Promise((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
function setup(interaction = {}, enabled = true) {
  const scope = vue.effectScope(),
    credentials = deferred(),
    response = deferred(),
    calls = [],
    events = []
  const owner = vue.ref(0)
  const props = vue.reactive({
    kitchenId: 'kitchen',
    offeringId: 'pickup',
    disabled: false,
    option: { key: 'collection', label: 'Collection', types: ['collection'] },
    offering: {
      id: 'pickup',
      name: 'Pickup',
      enabled,
      menu_ids: ['food'],
      hours: { timezone: 'Europe/Zurich' },
      interactions: [{ type: 'collection', enabled: true, ...interaction }],
    },
    menus: [
      { id: 'food', name: 'Food', status: 'published', format: 'interactive' },
    ],
    menusOutcome: 'ready',
    timezone: 'Europe/Zurich',
    captureIntent: () => {
      const epoch = owner.value
      return () => owner.value === epoch
    },
    save: async (input, current) => {
      const authored = structuredClone(JSON.parse(JSON.stringify(input)))
      await credentials.promise
      if (!current()) throw new Error('The form changed.')
      calls.push(authored)
      return response.promise
    },
  })
  const state = scope.run(() =>
    load(
      base + 'Workspace/Offerings/Setup.vue',
      'submit,resetDraft,menuIds,hoursText,enabled,savedEnabled,drafts,busy,error,menuOptions,hasOrderMenu,canSave',
      {
        ...vue,
        useCommandScope,
        defineProps: () => props,
        defineEmits: () => (event) => events.push(event),
        offeringOptionEnabled: offeringOverviewPolicy.offeringOptionEnabled,
        formatWeekdayTimeText: () => 'Tuesday 12:00 - 20:00',
        parseWeekdayTimeText: (text, timezone) => ({
          timezone,
          windows: [
            {
              day: 'tuesday',
              open: text.includes('13:00') ? '13:00' : '12:00',
              close: '20:00',
            },
          ],
        }),
        newKitchenOfferingInteraction: () => ({ enabled: true }),
        patchKitchenOfferingInteraction: (_type, previous, changes) => ({
          ...previous,
          ...changes,
        }),
        kitchenOrderTypeLabel: (type) => type,
      },
      true
    )
  )
  return { scope, credentials, response, calls, events, owner, props, state }
}
for (const change of ['cancel', 'draft', 'owner', 'offering', 'dispose']) {
  test(`Offering setup blocks predispatch ${change} changes, including return to the same value`, async () => {
    const h = setup(),
      saving = h.state.submit()
    if (change === 'cancel') {
      h.state.resetDraft()
    }
    if (change === 'draft') {
      h.state.hoursText.value = 'Tuesday 13:00 - 20:00'
      h.state.hoursText.value = 'Tuesday 12:00 - 20:00'
    }
    if (change === 'owner') h.owner.value++
    if (change === 'offering') {
      h.props.offeringId = 'other'
      h.props.offeringId = 'pickup'
    }
    if (change === 'dispose') h.scope.stop()
    h.credentials.resolve('token')
    await saving
    assert.deepEqual(h.calls, [])
    assert.deepEqual(h.events, [])
    h.scope.stop()
  })
}
test('Offering setup keeps an authored draft during same-owner live refresh and returns committed success after cancellation', async () => {
  const h = setup()
  h.state.hoursText.value = 'Tuesday 13:00 - 20:00'
  h.props.offering = {
    ...h.props.offering,
    name: 'Live name',
    menu_ids: ['other'],
    hours: { timezone: 'Europe/Zurich' },
  }
  h.props.disabled = true
  h.props.menusOutcome = 'pending'
  h.props.disabled = false
  h.props.menusOutcome = 'ready'
  assert.equal(h.state.hoursText.value, 'Tuesday 13:00 - 20:00')
  assert.deepEqual(h.state.menuIds.value, ['food'])
  const saving = h.state.submit()
  h.credentials.resolve('token')
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].hours.windows[0].open, '13:00')
  h.scope.stop()
  const committed = { ok: true, offering: { id: 'pickup' } }
  h.response.resolve(committed)
  assert.equal(await saving, committed)
  assert.deepEqual(h.events, [])
  h.scope.stop()
})
test('inline availability changes preserve the rest of the unsaved configuration', () => {
  const h = setup()
  h.state.hoursText.value = 'Tuesday 13:00 - 20:00'
  h.state.enabled.value = false
  assert.equal(h.state.enabled.value, false)
  h.state.enabled.value = true
  assert.equal(h.state.enabled.value, true)
  assert.equal(h.state.hoursText.value, 'Tuesday 13:00 - 20:00')
  assert.deepEqual(h.state.menuIds.value, ['food'])
  h.scope.stop()
  assert.deepEqual(h.calls, [])
  assert.equal(h.props.offering.enabled, true)
  h.scope.stop()
})
test('the Collection switch and configuration visibility use the same editor draft', async () => {
  const h = setup({}, false)
  const source = readFileSync(
    new URL(base + 'Workspace/Offerings/Setup.vue', import.meta.url),
    'utf8'
  )
  const template = parse(source).descriptor.template.content.replaceAll(
    'drafts[type]!',
    'drafts[type]'
  )
  const render = async () => {
    const app = vue.createSSRApp({
      setup: () => ({
        ...vue.toRefs(h.props),
        ...h.state,
        effectiveTimezone: 'Europe/Zurich',
        sharedLabels: [],
        activatesShared: false,
      }),
      render: vue.compile(template),
    })
    for (const name of [
      'UFormField',
      'UButton',
      'UAlert',
      'UCheckboxGroup',
      'UTextarea',
      'MoleculesStateCard',
    ]) {
      app.component(name, {
        props: ['label'],
        setup:
          (props, { slots }) =>
          () =>
            vue.h('section', props.label, slots.default?.()),
      })
    }
    app.component('USwitch', {
      props: ['modelValue'],
      setup: (props) => () =>
        vue.h('button', { role: 'switch', 'aria-checked': props.modelValue }),
    })
    return renderToString(app)
  }
  assert.match(await render(), /aria-checked="false"/)
  assert.match(await render(), /style="display:none;"/)
  h.state.enabled.value = true
  assert.match(await render(), /aria-checked="true"/)
  assert.doesNotMatch(await render(), /style="display:none;"/)
  assert.deepEqual(h.calls, [])
  h.scope.stop()
})

test('simplified Collection setup preserves saved settings that are not displayed', async () => {
  const stored = {
    availability: { paused: false },
    asap_enabled: true,
    notice_hours: 0.75,
    fulfilment: { handoff_instructions: 'Collect at reception' },
    customer: { required_fields: ['name'] },
  }
  const h = setup(stored)
  h.state.hoursText.value = 'Tuesday 13:00 - 20:00'
  const saving = h.state.submit()
  h.credentials.resolve('token')
  h.response.resolve({ ok: true })
  await saving
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.calls[0].interactions, [
    { type: 'collection', changes: { enabled: true } },
  ])
  assert.deepEqual(h.props.offering.interactions[0], {
    type: 'collection',
    enabled: true,
    ...stored,
  })
  h.scope.stop()
})
test('current Offering setup emits completion once and clears its own busy state', async () => {
  const h = setup(),
    saving = h.state.submit()
  h.credentials.resolve('token')
  h.response.resolve({ ok: true })
  await saving
  assert.deepEqual(h.events, ['saved'])
  assert.equal(h.state.busy.value, false)
  h.scope.stop()
})
test('Collection drafts are independent and discard restores saved configuration', () => {
  const first = setup()
  const second = setup()
  first.state.enabled.value = false
  first.state.menuIds.value = []
  first.state.hoursText.value = 'Tuesday 13:00 - 20:00'
  assert.equal(second.state.enabled.value, true)
  assert.deepEqual(second.state.menuIds.value, ['food'])
  first.state.resetDraft()
  assert.equal(first.state.enabled.value, true)
  assert.deepEqual(first.state.menuIds.value, ['food'])
  assert.equal(first.state.hoursText.value, 'Tuesday 12:00 - 20:00')
  assert.deepEqual(first.calls, [])
  first.scope.stop()
  second.scope.stop()
})

test('an existing Offering draft never becomes a create after a masked refresh or deletion', async () => {
  const h = setup()
  h.props.offering = undefined
  h.props.disabled = true
  h.props.menusOutcome = 'pending'
  h.props.disabled = false
  h.props.menusOutcome = 'ready'
  const saving = h.state.submit()
  h.credentials.resolve('token')
  h.response.resolve({ ok: true })
  await saving
  assert.equal(h.calls[0].offeringId, 'pickup')
  assert.equal(h.calls[0].name, 'Pickup')
  assert.deepEqual(h.calls[0].menu_ids, ['food'])
  h.scope.stop()
})

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
  assert.equal(published.at(-1).services.length, 6)
  scope.stop()
  assert.equal(published.at(-1).derived.outcome, 'idle')
})

test('Picnic customer URL stays on its exact offering across timing changes', () => {
  const props = vue.reactive({
    offering: {
      id: 'picnic',
      name: 'Picnic',
      enabled: true,
      separate: true,
      menu_ids: ['food'],
      collection_timing: 'next_day',
    },
    menus: [
      { id: 'food', name: 'Food', status: 'published', format: 'interactive' },
    ],
    menusOutcome: 'ready',
    kitchenSlug: 'baeren-ringgenberg',
  })
  const state = load(
    base + 'Workspace/Offerings/CustomerLinks.vue',
    'separateCustomerUrl',
    {
      ...vue,
      defineProps: () => props,
      useRequestURL: () => ({ origin: 'http://workspace.localhost:3001' }),
      useFireUXConfig: () => ({ isTenant: false }),
      menuWebsiteOrigin: () => 'http://localhost:3001',
      directoryMenuRouteScope: (slug) => ({ slug }),
      menuOfferingSummaries: () => [
        { interactions: [{ customerUrl: '/food' }] },
      ],
    },
    true
  )
  for (const timing of ['next_day', 'same_day', 'next_day']) {
    props.offering.collection_timing = timing
    assert.equal(
      state.separateCustomerUrl.value,
      'http://localhost:3001/kitchens/baeren-ringgenberg/menu.collection?offering=picnic'
    )
  }
  props.menus = []
  assert.equal(state.separateCustomerUrl.value, undefined)
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
  const configured = setup()
  configured.props.menus = menus
  assert.deepEqual(
    configured.state.menuOptions.value.map((row) => row.value),
    ['food', 'draft']
  )
  configured.state.menuIds.value = ['daily']
  assert.equal(configured.state.canSave.value, false)
  configured.state.menuIds.value = ['draft']
  assert.equal(configured.state.hasOrderMenu.value, false)
  configured.state.enabled.value = false
  assert.equal(configured.state.canSave.value, true)
  configured.scope.stop()
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
