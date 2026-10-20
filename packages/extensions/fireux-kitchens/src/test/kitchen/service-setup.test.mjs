import assert from 'node:assert/strict'
import test from 'node:test'
import * as vue from 'vue'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  offeringOverviewPolicy,
  loadOfferingSource,
} from '../offering-test-helpers.mjs'
const commandSource = readFileSync(
  new URL(
    '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  stripTypeScriptTypes(commandSource) + ';return useCommandScope',
  Object.keys(vue)
)(...Object.values(vue))
const core = loadOfferingSource('utils/weekday-time-core', 'weekdayTimeCore')
const config = loadOfferingSource(
  'utils/weekday-time-config',
  'weekdayTimeConfig',
  core
)
const { requireOperatingHours } = loadOfferingSource(
  'kitchen/utils/operating-hours',
  'requireOperatingHours',
  { readWeekdayTimeWindowsConfig: config.weekdayTimeConfig.readWindowsConfig }
)
const hoursAt = (open = '12:00') => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['tuesday'], open, close: '20:00' }],
})
function harness(existing = true, key = 'collection') {
  const scope = vue.effectScope(),
    calls = [],
    timers = new Map()
  let id = 0,
    fail = false,
    pause
  const stored = {
    id: 'collection',
    name: 'Collection',
    enabled: true,
    menu_ids: ['food'],
    hours: hoursAt(),
    interactions: [{ type: 'collection', enabled: true }],
  }
  const props = vue.reactive({
    kitchenId: 'kitchen',
    option: offeringOverviewPolicy.kitchenOfferingOptions.find(
      (row) => row.key === key
    ),
    offering: existing ? structuredClone(stored) : undefined,
    timezone: 'Europe/Zurich',
    disabled: false,
    save: async (input, current) => {
      if (pause) await pause
      if (!current()) throw Error('Kitchen changed')
      if (fail) throw Error('Connection failed')
      calls.push(structuredClone(input))
      return {
        offering: {
          ...stored,
          ...input,
          id: input.offeringId || 'created',
          interactions: [{ type: 'collection', enabled: input.enabled }],
        },
      }
    },
  })
  const state = scope.run(() =>
    loadOfferingSource(
      'kitchen/composables/offerings/useServiceSetup',
      'useServiceSetup',
      {
        ...vue,
        useCommandScope,
        offeringOptionEnabled: offeringOverviewPolicy.offeringOptionEnabled,
        newKitchenOfferingInteraction: (type) => ({ type, enabled: false }),
        requireOperatingHours,
        setTimeout: (callback) => {
          timers.set(++id, callback)
          return id
        },
        clearTimeout: (key) => timers.delete(key),
      }
    ).useServiceSetup(props)
  )
  return {
    state,
    scope,
    props,
    calls,
    timers,
    fail: () => {
      fail = true
    },
    pause: (value) => {
      pause = value
    },
    flush: async () => {
      const pending = [...timers.values()]
      timers.clear()
      for (const callback of pending) await callback()
    },
  }
}
test('Collection toggles persist immediately and preserve menu/hour fields', async () => {
  const h = harness()
  await h.state.setEnabled(false)
  assert.equal(h.state.enabled.value, false)
  assert.equal(h.calls[0].enabled, false)
  assert.equal('menu_ids' in h.calls[0], false)
  assert.equal('hours' in h.calls[0], false)
  await h.state.setEnabled(true)
  assert.equal(h.calls[1].enabled, true)
  assert.equal(h.calls[1].offeringId, 'collection')
  h.scope.stop()
})
test('first On creates once and subsequent changes use the returned identity', async () => {
  const h = harness(false)
  assert.equal(h.state.enabled.value, false)
  await h.state.setEnabled(true)
  await h.state.setMenus(['drinks'])
  assert.equal('offeringId' in h.calls[0], false)
  assert.equal(h.calls[1].offeringId, 'created')
  assert.deepEqual(h.calls[1].menu_ids, ['drinks'])
  assert.deepEqual(h.calls[1].interactions, [
    { type: 'collection', changes: {} },
  ])
  h.scope.stop()
})
test('hours edits coalesce and incomplete ranges never reach the command', async () => {
  const h = harness()
  h.state.setHours(hoursAt('13:00'))
  h.state.setHours(hoursAt('14:00'))
  assert.equal(h.calls.length, 0)
  assert.equal(h.timers.size, 1)
  await h.flush()
  assert.deepEqual(h.calls[0].hours, hoursAt('14:00'))
  h.state.setHours({
    ...hoursAt(),
    windows: [{ days: [], open: '', close: '' }],
  })
  await h.flush()
  assert.equal(h.calls.length, 1)
  assert.match(h.state.error.value, /invalid range/)
  h.scope.stop()
})
test('failed toggle and menu changes roll back visibly and show an error', async () => {
  const h = harness()
  h.fail()
  await h.state.setEnabled(false)
  assert.equal(h.state.enabled.value, true)
  await h.state.setMenus([])
  assert.deepEqual(h.state.menuIds.value, ['food'])
  assert.equal(h.state.error.value, 'Connection failed')
  assert.equal(h.state.busy.value, false)
  h.scope.stop()
})
test('turning off flushes pending valid hours in the same update', async () => {
  const h = harness()
  h.state.setHours(hoursAt('15:00'))
  await h.state.setEnabled(false)
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.calls[0].hours, hoursAt('15:00'))
  assert.equal(h.timers.size, 0)
  h.scope.stop()
})
test('scope disposal cancels scheduled updates and stale predispatch writes', async () => {
  const h = harness()
  h.state.setHours(hoursAt('15:00'))
  h.scope.stop()
  await h.flush()
  assert.equal(h.calls.length, 0)
  const other = harness()
  let resolve
  other.pause(
    new Promise((done) => {
      resolve = done
    })
  )
  const pending = other.state.setEnabled(false)
  other.props.kitchenId = 'other'
  resolve()
  await pending
  assert.equal(other.calls.length, 0)
  other.scope.stop()
})

test('every service creates from On without a manual Save or prior menus/hours', async () => {
  for (const option of offeringOverviewPolicy.kitchenOfferingOptions) {
    const h = harness(false, option.key)
    await h.state.setEnabled(true)
    assert.equal(h.calls.length, 1, option.key)
    assert.equal(h.calls[0].option, option.key)
    assert.equal(h.calls[0].enabled, true)
    assert.deepEqual(
      h.calls[0].interactions.map((row) => row.type),
      option.types
    )
    assert.equal('menu_ids' in h.calls[0], false)
    assert.equal('hours' in h.calls[0], false)
    h.scope.stop()
  }
})
test('a policy edit sends only its patch while retaining the shared configuration', async () => {
  const h = harness(true)
  await h.state.updateInteraction('collection', { notice_hours: 2 })
  assert.deepEqual(h.calls[0].interactions, [
    { type: 'collection', changes: { notice_hours: 2 } },
  ])
  assert.equal('menu_ids' in h.calls[0], false)
  assert.equal('hours' in h.calls[0], false)
  h.scope.stop()
})

test('pending hours cannot cross a Kitchen switch, access loss or service replacement', async () => {
  for (const change of [
    (props) => {
      props.kitchenId = 'different-kitchen'
    },
    (props) => {
      props.disabled = true
    },
    (props) => {
      props.offering = { ...props.offering, id: 'different-service' }
    },
  ]) {
    const h = harness()
    h.state.setHours(hoursAt('18:00'))
    change(h.props)
    await h.flush()
    assert.deepEqual(h.calls, [])
    h.scope.stop()
  }
})

test('removing every range sends only a null hours patch to the current service', async () => {
  const h = harness()
  h.state.setHours(null)
  await h.flush()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].hours, null)
  assert.equal(h.calls[0].offeringId, 'collection')
  assert.equal('menu_ids' in h.calls[0], false)
  h.scope.stop()
})

test('Yes and No save inheritance immediately without copying parent ranges', async () => {
  const h = harness()
  await h.state.setSameAsKitchen(false)
  assert.equal(h.state.sameAsKitchen.value, false)
  assert.equal(h.calls[0].hours_source, 'custom')
  assert.equal(h.calls[0].hours, null)
  await h.state.setSameAsKitchen(true)
  assert.equal(h.state.sameAsKitchen.value, true)
  assert.equal(h.calls[1].hours_source, 'kitchen')
  assert.equal(h.calls[1].hours, null)
  assert.equal('menu_ids' in h.calls[1], false)
  h.scope.stop()
})

test('unfinished autosave hours stay local through refresh and resume only after write readiness returns', async () => {
  const h = harness()
  h.state.setHours(hoursAt('18:00'))
  h.props.disabled = true
  await h.flush()
  assert.equal(h.calls.length, 0)
  h.props.offering = { ...h.props.offering, hours: hoursAt('12:00') }
  await vue.nextTick()
  assert.equal(h.state.hours.value.windows[0].open, '18:00')
  h.props.disabled = false
  await h.flush()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].hours.windows[0].open, '18:00')
  h.scope.stop()
})
