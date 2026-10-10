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
    Object.keys(deps)
  )(...Object.values(deps))
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
    menus: [{ id: 'food', name: 'Food', status: 'published' }],
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
      'submit,menuIds,hoursText,enabled,drafts,busy,error',
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
test('new Offering creation forwards local intent and cannot navigate after a cancelled credential wait', async () => {
  const scope = vue.effectScope(),
    credentials = deferred(),
    calls = [],
    routes = []
  const state = scope.run(() =>
    load(
      base + 'Workspace/Offerings/Create.vue',
      'submit,open,name',
      {
        ...vue,
        useCommandScope,
        defineProps: () => ({
          captureIntent: () => () => true,
          create: async (name, current) => {
            await credentials.promise
            if (!current()) throw new Error('Form closed.')
            calls.push(name)
            return { ok: true, offering: { id: 'new' } }
          },
        }),
        navigateTo: (path) => routes.push(path),
      },
      true
    )
  )
  state.open.value = true
  state.name.value = 'Lunch'
  const saving = state.submit()
  state.open.value = false
  state.open.value = true
  credentials.resolve('token')
  await saving
  assert.deepEqual(calls, [])
  assert.deepEqual(routes, [])
  scope.stop()
})
for (const path of ['Ordering/Setup.vue', 'Workspace/Offerings/Index.vue']) {
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

test('a saved Offering with failed navigation offers its exact editor without retrying creation', async () => {
  const scope = vue.effectScope(),
    calls = []
  const committed = { ok: true, offering: { id: 'saved' } }
  const state = scope.run(() =>
    load(
      base + 'Workspace/Offerings/Create.vue',
      'submit,open,name,error,busy,createdOfferingId',
      {
        ...vue,
        useCommandScope,
        defineProps: () => ({
          captureIntent: () => () => true,
          create: async (name) => {
            calls.push(name)
            return committed
          },
        }),
        navigateTo: async () => {
          throw new Error('Navigation failed')
        },
      },
      true
    )
  )
  state.open.value = true
  state.name.value = 'Lunch'
  assert.equal(await state.submit(), committed)
  assert.equal(state.createdOfferingId.value, 'saved')
  assert.equal(state.open.value, true)
  assert.equal(state.busy.value, false)
  assert.match(state.error.value, /offering was saved/)
  await state.submit()
  assert.deepEqual(calls, ['Lunch'])
  const source = readFileSync(
    new URL(base + 'Workspace/Offerings/Create.vue', import.meta.url),
    'utf8'
  )
  const actions = source.match(/<template #actions>([\s\S]*?)<\/template>/)[1]
  assert.match(actions, /<UButton[\s\S]*label="Open offering"/)
  assert.match(
    actions,
    /:to="'\/workspace\/kitchen\/offerings\/' \+ createdOfferingId"/
  )
  assert.doesNotMatch(source, /:actions=/)
  scope.stop()
})
