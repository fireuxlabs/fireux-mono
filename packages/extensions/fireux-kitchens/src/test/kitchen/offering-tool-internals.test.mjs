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
const deferred = () => {
  let resolve
  const promise = new Promise((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
function setup() {
  const scope = vue.effectScope(),
    credentials = deferred(),
    response = deferred(),
    calls = [],
    events = []
  const owner = vue.ref(0)
  const props = vue.reactive({
    kitchenId: 'kitchen',
    offeringId: 'pickup',
    active: true,
    disabled: false,
    option: { key: 'collection', label: 'Collection', types: ['collection'] },
    offering: {
      id: 'pickup',
      name: 'Pickup',
      enabled: true,
      menu_ids: ['food'],
      hours: { timezone: 'Europe/Zurich' },
      interactions: [{ type: 'collection', enabled: true }],
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
      'submit,menuIds,hoursText,enabled,drafts,busy,error,menuOptions,hasOrderMenu,canSave',
      {
        ...vue,
        useCommandScope,
        defineProps: () => props,
        defineEmits: () => (event) => events.push(event),
        offeringOptionEnabled: () => true,
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
      h.props.active = false
      h.props.active = true
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
  h.props.active = false
  const committed = { ok: true, offering: { id: 'pickup' } }
  h.response.resolve(committed)
  assert.equal(await saving, committed)
  assert.deepEqual(h.events, [])
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
for (const path of ['Workspace/Offerings/Index.vue']) {
  test(`${path} retains its modal during child refresh and closes it on sticky owner changes`, () => {
    const scope = vue.effectScope(),
      ownerScope = vue.ref(0),
      canWrite = vue.ref(true),
      offerings = vue.ref([])
    const state = scope.run(() =>
      load(
        base + path,
        'openSetup,setupOpen,selectedOption',
        {
          ...vue,
          defineProps: () => ({ kitchenId: 'kitchen' }),
          useKitchenOfferings: () => ({
            kitchenId: vue.ref('kitchen'),
            selectedKitchen: vue.ref({ id: 'kitchen' }),
            outcome: vue.ref('ready'),
            offerings,
            ownerScope,
            captureIntent: () => () => true,
            canWrite,
            menus: vue.ref([]),
            menusOutcome: vue.ref('ready'),
            timezone: vue.ref('Europe/Zurich'),
            name: vue.ref('Kitchen'),
            configure() {},
            create() {},
          }),
          useWorkspace: () => ({ select() {} }),
          useWorkspaceEntryCta: () => ({
            workspaceEntryPath: vue.ref('/workspace/kitchen'),
          }),
          navigateTo() {},
          kitchenOfferingOptions: [],
          offeringsForOption: () => [],
          offeringOptionEnabled: () => false,
          offeringSetupSummary: () => ({}),
          formatWeekdayTimeText: () => '',
        },
        true
      )
    )
    state.openSetup({ key: 'collection' })
    canWrite.value = false
    offerings.value = []
    canWrite.value = true
    assert.equal(state.setupOpen.value, true)
    ownerScope.value++
    assert.equal(state.setupOpen.value, false)
    assert.equal(state.selectedOption.value, undefined)
    const source = readFileSync(new URL(base + path, import.meta.url), 'utf8')
    assert.match(source, /:active="setupOpen"/)
    assert.match(source, /:capture-intent="captureIntent"/)
    scope.stop()
  })
}

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

test('Collection and Delivery overview include all matching services and configure the exact record', () => {
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
      'entries,openSetup,selectedOffering,selectedOfferingId,setupOpen,menuNames',
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
  for (const [option, id] of [
    [collection.option, 'concept'],
    [collection.option, 'off'],
    [delivery.option, 'off'],
    [delivery.option, 'delivery'],
  ]) {
    state.openSetup(option, undefined, id)
    assert.equal(state.selectedOfferingId.value, id)
    assert.equal(state.selectedOffering.value.id, id)
    assert.equal(state.setupOpen.value, true)
  }
  assert.equal(state.menuNames(offerings.value[1]), 'Packed lunches')
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
  for (const component of ['Menus']) {
    const scope = vue.effectScope()
    const props = vue.reactive({
      kitchenId: 'k',
      active: true,
      disabled: false,
      menus,
      menusOutcome: 'ready',
      outcome: 'ready',
      timezone: 'Europe/Zurich',
      venueHours: null,
      offering: { menu_ids: ['draft'] },
    })
    const state = scope.run(() =>
      load(
        base + `Workspace/Offerings/${component}.vue`,
        component === 'Create'
          ? 'menuOptions,menuIds,menuReadiness'
          : 'options,menuReadiness',
        {
          ...vue,
          useCommandScope,
          defineProps: () => props,
          defineEmits: () => () => {},
          formatWeekdayTimeText: () => '',
        },
        true
      )
    )
    assert.deepEqual(
      (state.menuOptions || state.options).value.map((row) => row.value),
      ['food', 'draft']
    )
    if (component === 'Create') state.menuIds.value = ['draft']
    assert.deepEqual(state.menuReadiness.value, {
      validSelection: true,
      hasPublishedMenu: false,
      canEnable: false,
    })
    scope.stop()
  }
})
