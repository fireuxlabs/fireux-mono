import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as vue from 'vue'
import { loadOfferingSource } from '../offering-test-helpers.mjs'
const core = loadOfferingSource('utils/weekday-time-core', 'weekdayTimeCore')
const config = loadOfferingSource(
  'utils/weekday-time-config',
  'weekdayTimeConfig',
  core
)
const { requireOperatingHours } = loadOfferingSource(
  'kitchen/utils/operating-hours',
  'requireOperatingHours',
  {
    readWeekdayTimeWindowsConfig: config.weekdayTimeConfig.readWindowsConfig,
  }
)
const source = readFileSync(
  new URL(
    '../../runtime/kitchen/components/Workspace/Offerings/Setup/Hours.vue',
    import.meta.url
  ),
  'utf8'
)
  .split('<script setup lang="ts">')[1]
  .split('</script>')[0]
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
const hours = {
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['tuesday', 'wednesday'], open: '16:00', close: '22:45' }],
}
function harness(value = hours, extra = {}) {
  const scope = vue.effectScope(),
    emitted = []
  const props = vue.reactive({
    value: structuredClone(value),
    timezone: 'Europe/Zurich',
    disabled: false,
    ...extra,
  })
  const deps = {
    ...vue,
    requireOperatingHours,
    defineProps: () => props,
    defineEmits: () => (_, value) => emitted.push(structuredClone(value)),
  }
  const state = scope.run(() =>
    compileFunction(
      stripTypeScriptTypes(source) +
        '; return {ranges,configuration,incomplete,add,update,remove}',
      Object.keys(deps)
    )(...Object.values(deps))
  )
  return { scope, props, emitted, ...state }
}
test('hydration preserves saved days and times without writing', async () => {
  const h = harness()
  assert.deepEqual(h.configuration.value, hours)
  assert.deepEqual(h.emitted, [])
  h.props.value = {
    ...hours,
    windows: [{ days: ['sunday'], open: '11:00', close: '15:00' }],
  }
  await vue.nextTick()
  assert.equal(h.ranges.value[0].value.open, '11:00')
  assert.deepEqual(h.emitted, [])
  h.scope.stop()
})
test('a new range stays local until its days and both times are complete', () => {
  const h = harness(null)
  h.add()
  h.update(0, { days: ['friday'], open: '', close: '' })
  assert.equal(h.incomplete.value, true)
  assert.deepEqual(h.emitted, [])
  h.update(0, { days: ['friday'], open: '18:00', close: '02:00' })
  assert.deepEqual(h.emitted[0].windows, [
    { days: ['friday'], open: '18:00', close: '02:00' },
  ])
  h.scope.stop()
})
test('split service ranges and removal preserve the remaining schedule', () => {
  const h = harness()
  h.add()
  assert.deepEqual(h.emitted, [])
  h.update(1, { days: ['sunday'], open: '11:30', close: '13:30' })
  assert.equal(h.emitted[0].windows.length, 2)
  h.remove(0)
  assert.deepEqual(h.emitted[1].windows, [
    { days: ['sunday'], open: '11:30', close: '13:30' },
  ])
  h.remove(0)
  assert.equal(h.emitted[2], null)
  h.scope.stop()
})
test('read-only or missing timezone never emits a write', () => {
  for (const extra of [{ disabled: true }, { timezone: '' }]) {
    const h = harness(hours, extra)
    h.update(0, { days: ['sunday'], open: '12:00', close: '14:00' })
    assert.deepEqual(h.emitted, [])
    h.scope.stop()
  }
})

test('discarding an unfinished new range does not rewrite unchanged hours', () => {
  const h = harness()
  h.add()
  h.remove(1)
  assert.deepEqual(h.emitted, [])
  h.scope.stop()
})

for (const fixture of [
  { name: 'new kitchen', timezone: 'UTC', windows: [] },
  {
    name: 'weekday cafe',
    timezone: 'America/New_York',
    windows: [
      {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        open: '07:00',
        close: '15:00',
      },
    ],
  },
  {
    name: 'split service kitchen',
    timezone: 'Asia/Tokyo',
    windows: [
      { days: ['saturday'], open: '11:00', close: '14:00' },
      { days: ['saturday'], open: '18:00', close: '23:00' },
      { days: ['sunday'], open: '20:00', close: '02:00' },
    ],
  },
]) {
  test(`${fixture.name}: ranges can be added and all removed without venue defaults`, () => {
    const value = fixture.windows.length
      ? {
          source: 'custom',
          timezone: fixture.timezone,
          windows: fixture.windows,
        }
      : null
    const h = harness(value, { timezone: fixture.timezone })
    assert.equal(h.ranges.value.length, fixture.windows.length)
    assert.deepEqual(h.emitted, [])
    h.add()
    const added = h.ranges.value.length - 1
    assert.deepEqual(h.ranges.value[added].value, {
      days: [],
      open: '',
      close: '',
    })
    h.update(added, { days: ['sunday'], open: '10:15', close: '12:45' })
    assert.equal(h.emitted.at(-1).timezone, fixture.timezone)
    assert.equal(h.emitted.at(-1).windows.length, fixture.windows.length + 1)
    while (h.ranges.value.length) h.remove(0)
    assert.equal(h.emitted.at(-1), null)
    h.add()
    h.update(0, { days: ['monday'], open: '08:00', close: '08:00' })
    assert.deepEqual(h.emitted.at(-1).windows, [
      { days: ['monday'], open: '08:00', close: '08:00' },
    ])
    h.scope.stop()
  })
}

test('simultaneous Kitchens have independent range drafts and timezone payloads', () => {
  const a = harness(null, { timezone: 'UTC' })
  const b = harness(null, { timezone: 'Pacific/Auckland' })
  a.add()
  a.update(0, { days: ['friday'], open: '22:00', close: '03:00' })
  assert.equal(b.ranges.value.length, 0)
  assert.deepEqual(b.emitted, [])
  b.add()
  b.update(0, { days: ['monday'], open: '06:00', close: '11:00' })
  assert.equal(a.emitted.at(-1).timezone, 'UTC')
  assert.equal(b.emitted.at(-1).timezone, 'Pacific/Auckland')
  a.remove(0)
  assert.equal(b.ranges.value.length, 1)
  assert.deepEqual(b.emitted.at(-1).windows[0].days, ['monday'])
  a.scope.stop()
  b.scope.stop()
})

test('removing the last selected day stays local until the range is fixed or removed', () => {
  const h = harness()
  h.update(0, { days: [], open: '16:00', close: '22:45' })
  assert.equal(h.incomplete.value, true)
  assert.deepEqual(h.emitted, [])
  h.remove(0)
  assert.deepEqual(h.emitted, [null])
  h.scope.stop()
})

test('a saved-hours acknowledgement preserves an unfinished additional range', async () => {
  const h = harness()
  h.update(0, { days: ['monday'], open: '09:00', close: '17:00' })
  const saved = h.emitted.at(-1)
  h.add()
  h.props.value = saved
  await vue.nextTick()
  assert.equal(h.ranges.value.length, 2)
  assert.deepEqual(h.ranges.value[1].value, { days: [], open: '', close: '' })
  assert.equal(h.emitted.length, 1)
  h.scope.stop()
})
