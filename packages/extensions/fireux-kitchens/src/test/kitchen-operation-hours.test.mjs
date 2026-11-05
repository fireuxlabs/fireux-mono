import {
  weekdayHoursConstraints,
  serviceHoursPolicy,
} from './offering-test-helpers.mjs'
import { commandScopeDeps } from './command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, watch, effectScope } from 'vue'

function load(path, names, dependencies = {}) {
  dependencies = commandScopeDeps(dependencies)
  let source = readFileSync(
    new URL(`../runtime/${path}`, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export \{[\s\S]*?\} from [^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const core = load('utils/weekday-time-core.ts', 'weekdayTimeCore')
const config = load('utils/weekday-time-config.ts', 'weekdayTimeConfig', core)
const format = load('utils/weekday-time-format.ts', 'weekdayTimeFormat', {
  ...core,
  ...config,
})
const helpers = {
  parseWeekdayTimeText: config.weekdayTimeConfig.parseText,
  formatWeekdayTimeText: format.weekdayTimeFormat.formatText,
}
const { requireOperatingHours } = load(
  'kitchen/utils/operating-hours.ts',
  'requireOperatingHours',
  { readWeekdayTimeWindowsConfig: config.weekdayTimeConfig.readWindowsConfig }
)
const { resolveKitchenOperationHours } = load(
  'kitchen/utils/kitchen-readers.ts',
  'resolveKitchenOperationHours',
  {
    readWeekdayTimeWindowsConfig: config.weekdayTimeConfig.readWindowsConfig,
    readPlaceBusinessHours: (place) => place?.business_hours,
    ...weekdayHoursConstraints,
  }
)
const custom = helpers.parseWeekdayTimeText(
  'Wednesday - Sunday 17:00 - 22:00',
  'Europe/Zurich'
)
const venue = {
  ...helpers.parseWeekdayTimeText(
    'Monday - Sunday 12:00 - 23:00',
    'Europe/Zurich'
  ),
  source: 'place',
}

function command({ denied = false } = {}) {
  const writes = []
  const deleted = Symbol('deleted')
  const trace = []
  const tx = {
    update: (...args) => {
      trace.push('write')
      writes.push(args)
    },
  }
  const api = load(
    'kitchen/server/ordering/hours.ts',
    'updateKitchenOperationHours',
    {
      createError: ({ statusMessage }) => new Error(statusMessage),
      requireFirestoreDocumentId: (id) => {
        if (!id || typeof id !== 'string' || id.includes('/'))
          throw new Error('Kitchen id')
        return id
      },
      requireOperatingHours,
      resolveKitchenOperationHours,
      ...serviceHoursPolicy,
      readKitchenMutationActor: async () => ({ uid: 'operator' }),
      requireKitchenMutationAuthority: async () => {
        trace.push('authorize')
        if (denied) throw new Error('Access denied')
        return {
          ownerAppId: 'misebox-app',
          placeData: { business_hours: venue },
        }
      },
      runGuardedServerTransaction: async (_, callback) => callback(tx),
      KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
      serverAuditStamp: (stamp) => stamp,
      FieldValue: { delete: () => deleted },
    }
  )
  return { ...api, writes, trace, deleted }
}

test('venue, Kitchen and service schedules resolve independently', () => {
  const place = { business_hours: venue }
  assert.deepEqual(resolveKitchenOperationHours({}, place), venue)
  const kitchen = { orders: { operation_hours: custom } }
  assert.deepEqual(resolveKitchenOperationHours(kitchen, place), custom)
  assert.throws(() => requireOperatingHours(undefined))
  const separate = requireOperatingHours(
    helpers.parseWeekdayTimeText('Friday 18:00 - 20:00', 'Europe/Zurich')
  )
  assert.equal(separate.windows[0].open, '18:00')
  assert.equal(custom.windows[0].open, '17:00')
  assert.equal(venue.windows[0].open, '12:00')
})

test('Kitchen hours command authorizes first and writes only its schedule and audit stamp', async () => {
  const api = command()
  await api.updateKitchenOperationHours(
    {},
    { kitchenId: 'kitchen', hours: custom }
  )
  assert.deepEqual(api.trace, ['authorize', 'write'])
  assert.deepEqual(api.writes[0], [
    'kitchens',
    'kitchen',
    {
      'orders.operation_hours': custom,
      updated: { by: 'operator', appId: 'misebox-app' },
    },
  ])
  await api.updateKitchenOperationHours(
    {},
    { kitchenId: 'kitchen', hours: null }
  )
  assert.equal(api.writes[1][2]['orders.operation_hours'], api.deleted)
})

test('denied and malformed hours cannot write or change service switches', async () => {
  const denied = command({ denied: true })
  await assert.rejects(
    denied.updateKitchenOperationHours(
      {},
      { kitchenId: 'kitchen', hours: custom }
    ),
    /Access denied/
  )
  assert.equal(denied.writes.length, 0)
  for (const input of [
    { kitchenId: 'kitchen' },
    { kitchenId: 'kitchen', hours: custom, enabled: true },
    { kitchenId: 'kitchen', hours: { ...custom, timezone: 'invalid/zone' } },
    { kitchenId: 'kitchen', hours: { ...custom, windows: [] } },
    { kitchenId: 'kitchen', hours: { ...custom, source: 'place' } },
    {
      kitchenId: 'kitchen',
      hours: {
        ...custom,
        windows: [{ days: ['friday'], open: 'oops', close: '22:00' }],
      },
    },
  ]) {
    const api = command()
    await assert.rejects(api.updateKitchenOperationHours({}, input))
    assert.equal(api.writes.length, 0)
  }
})

test('Kitchen weekly editor saves only explicit custom hours and restores inheritance', async () => {
  const scope = effectScope()
  const writes = []
  const props = {
    kitchen: { id: 'kitchen' },
    place: { business_hours: venue },
    canWrite: true,
  }
  try {
    const ui = scope.run(() =>
      load(
        'kitchen/components/OperatingHours/Kitchen.vue',
        'customRequested, usesVenueHours, updateHours, useVenueHours',
        {
          computed,
          ref,
          watch,
          defineProps: () => props,
          resolveKitchenOperationHours,
          useKitchenOperationHours: () => ({
            captureIntent: () => () => true,
            updateHours: async (...args) => writes.push(args),
          }),
        }
      )
    )
    assert.equal(ui.usesVenueHours.value, true)
    ui.customRequested.value = true
    assert.equal(writes.length, 0)
    await ui.updateHours({ windows: custom.windows })
    assert.deepEqual(writes[0], ['kitchen', custom])
    await assert.rejects(
      ui.updateHours({ windows: [] }),
      /at least one opening time/
    )
    props.canWrite = false
    await assert.rejects(
      ui.updateHours({ windows: custom.windows }),
      /read-only/
    )
    assert.equal(writes.length, 1)
    props.canWrite = true
    await ui.useVenueHours()
    assert.deepEqual(writes[1], ['kitchen', null])
  } finally {
    scope.stop()
  }
})

test('Kitchen hours cannot extend outside Place hours', async () => {
  const api = command()
  await assert.rejects(
    api.updateKitchenOperationHours(
      {},
      {
        kitchenId: 'kitchen',
        hours: helpers.parseWeekdayTimeText(
          'Tuesday 11:00 - 22:00',
          'Europe/Zurich'
        ),
      }
    ),
    /within venue/
  )
  assert.equal(api.writes.length, 0)
  const narrowed = resolveKitchenOperationHours(
    {
      orders: {
        operation_hours: helpers.parseWeekdayTimeText(
          'Tuesday 11:00 - 22:00',
          'Europe/Zurich'
        ),
      },
    },
    { business_hours: venue }
  )
  assert.equal(narrowed.windows[0].open, '12:00')
})
