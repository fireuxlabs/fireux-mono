import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from './kitchen/kiosk-test-helpers.mjs'
const core = load('../../runtime/utils/weekday-time-core.ts', 'weekdayTimeCore')
const config = load(
  '../../runtime/utils/weekday-time-config.ts',
  'weekdayTimeConfig',
  core
)
const format = load(
  '../../runtime/utils/weekday-time-format.ts',
  'weekdayTimeFormat',
  { ...core, ...config }
)
const state = load(
  '../../runtime/utils/weekday-time-state.ts',
  'weekdayTimeState',
  { ...core, ...config, ...format }
)
const time = {
  weekdayTimeDays: core.weekdayTimeCore.days,
  readWeekdayTimeWindowsConfig: config.weekdayTimeConfig.readWindowsConfig,
  readWeekdayTimeNoticeState: state.weekdayTimeState.notice,
  readWeekdayTimeOpenState: state.weekdayTimeState.open,
  readWeekdayTimeSelectionState: state.weekdayTimeState.selection,
}
const { menuOrderTimeOptions } = load(
  '../../runtime/menu/utils/menu-order-time.ts',
  'menuOrderTimeOptions',
  time
)
let now = new Date('2026-09-27T09:00:00Z')
const hours = {
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [
    {
      days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      open: '16:00',
      close: '22:30',
    },
    { days: ['sunday'], open: '12:15', close: '20:30' },
  ],
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const strategy = load(
  '../../runtime/menu/server/ordering/order-type.ts',
  'menuOrderTypeStrategy'
)
const { validateMenuOrderSchedule } = load(
  '../../runtime/menu/server/ordering/schedule.ts',
  'validateMenuOrderSchedule',
  {
    ...strategy,
    ...time,
    createError,
    readWeekdayTimeOpenState: (hours) =>
      time.readWeekdayTimeOpenState(hours, now),
    readWeekdayTimeNoticeState: (hours, requested, notice) =>
      time.readWeekdayTimeNoticeState(hours, requested, notice, now),
    menuOrderTimeOptions: (input) => menuOrderTimeOptions({ ...input, now }),
  }
)
const lifecycle = load(
  '../../runtime/kitchen/models/order-lifecycle.model.ts',
  'resolveKitchenOrderIntakeStatus,deriveKitchenOrderBoardStage,isKitchenOrderPaymentSatisfied,kitchenOrderTransitionRule,isKitchenOrderStatus'
)
const { buildKitchenOrderTransitionPatch } = load(
  '../../runtime/kitchen/server/orders/transition.ts',
  'buildKitchenOrderTransitionPatch',
  { ...lifecycle, createError, Timestamp: { fromMillis: (value) => value } }
)
const base = {
  hours,
  orderType: 'collection',
  requestedFor: '',
  noticeHours: 0.5,
  slotIntervalMinutes: 30,
  scheduleHorizonDays: 7,
}
const scheduled = (requested_for) => ({
  ...base,
  collection: { mode: 'scheduled', requested_for },
})

test('room, table and kiosk command timing checks actual service hours; future delivery differs from pickup grid', () => {
  const original = now
  try {
    for (const [instant, open] of [
      ['2026-09-29T13:59:00Z', false],
      ['2026-09-29T14:00:00Z', true],
      ['2026-09-29T20:29:00Z', true],
      ['2026-09-29T20:30:00Z', false],
      ['2026-09-28T15:00:00Z', false],
    ]) {
      now = new Date(instant)
      for (const orderType of [
        'room_service',
        'dine_in',
        'eat_in',
        'takeaway',
        'delivery',
      ]) {
        const check = () =>
          validateMenuOrderSchedule({ ...base, orderType, collection: null })
        if (open) assert.doesNotThrow(check, `${orderType}: ${instant}`)
        else
          assert.throws(
            check,
            /outside serving hours/,
            `${orderType}: ${instant}`
          )
      }
    }
    now = new Date('2026-09-28T15:00:00Z')
    for (const orderType of ['delivery', 'pre_order']) {
      // Existing non-pickup commands enforce hours and notice, but not pickup's grid/horizon.
      assert.doesNotThrow(() =>
        validateMenuOrderSchedule({
          ...base,
          orderType,
          collection: null,
          requestedFor: '2026-10-13T16:07:00',
        })
      )
      assert.throws(
        () =>
          validateMenuOrderSchedule({
            ...base,
            orderType,
            collection: null,
            requestedFor: '2026-09-27T16:00:00',
          }),
        /future|at least/
      )
    }
  } finally {
    now = original
  }
})

test('pickup boundaries preserve split-day breaks, exclusive closing and exact notice', () => {
  const splitHours = {
    ...hours,
    windows: [
      { days: ['tuesday'], open: '11:00', close: '14:00' },
      { days: ['tuesday'], open: '17:00', close: '22:00' },
    ],
  }
  for (const [instant, available] of [
    ['2026-09-29T08:59:00Z', false],
    ['2026-09-29T09:00:00Z', true],
    ['2026-09-29T11:59:00Z', true],
    ['2026-09-29T12:00:00Z', false],
    ['2026-09-29T14:59:00Z', false],
    ['2026-09-29T15:00:00Z', true],
    ['2026-09-29T20:00:00Z', false],
  ]) {
    assert.equal(
      menuOrderTimeOptions({
        ...base,
        hours: splitHours,
        now: new Date(instant),
      }).queueAvailable,
      available,
      instant
    )
  }
  const slots = (instant) =>
    menuOrderTimeOptions({
      ...base,
      hours: splitHours,
      now: new Date(instant),
    }).days.flatMap((day) =>
      day.slots.map((slot) => slot.requestedFor.slice(0, 16))
    )
  assert.ok(slots('2026-09-29T08:30:00Z').includes('2026-09-29T11:00'))
  assert.ok(!slots('2026-09-29T08:31:00Z').includes('2026-09-29T11:00'))
  const offered = slots('2026-09-29T08:00:00Z')
  assert.ok(offered.includes('2026-09-29T13:30'))
  assert.ok(!offered.includes('2026-09-29T14:00'))
  assert.ok(!offered.includes('2026-09-29T16:30'))
  assert.ok(offered.includes('2026-09-29T17:00'))
})

test('server accepts only offered pickup slots: hours, weekly closure, notice, interval, horizon, missing schedule', () => {
  const options = menuOrderTimeOptions({ ...base, now })
  const first = options.days[0].slots[0].requestedFor
  assert.equal(options.days[0].slots[0].label, '12:15')
  assert.doesNotThrow(() => validateMenuOrderSchedule(scheduled(first)))
  for (const value of [
    '2026-09-28T16:00',
    '2026-09-27T12:16',
    '2026-10-04T12:15',
    '2026-09-27T20:30',
    '2026-09-27T10:00',
    'not-a-date',
  ])
    assert.throws(
      () => validateMenuOrderSchedule(scheduled(value)),
      /unavailable/
    )
  assert.throws(
    () => validateMenuOrderSchedule({ ...scheduled(first), hours: undefined }),
    /unavailable/
  )
  assert.throws(
    () => validateMenuOrderSchedule({ ...scheduled(first), noticeHours: 48 }),
    /unavailable/
  )
  assert.throws(
    () => validateMenuOrderSchedule({ ...base, collection: { mode: 'queue' } }),
    /unavailable/
  )
  const duringOpen = {
    ...base,
    asapEnabled: false,
    collection: { mode: 'queue' },
  }
  assert.throws(() => validateMenuOrderSchedule(duringOpen), /unavailable/)
})

test('scheduled and ASAP requests defer method choice and require confirmation', async () => {
  const { resolveMenuOrderFulfilment } = load(
    '../../runtime/menu/server/ordering/order-fulfilment.ts',
    'resolveMenuOrderFulfilment',
    {
      ...strategy,
      ...lifecycle,
      createError,
      validateMenuOrderSchedule: () => {},
      resolveMenuOrderPayment: () => ({
        required: false,
        status: 'not_required',
        method: 'pay_later',
      }),
      numberValue: Number,
    }
  )
  const command = {
    orderType: 'collection',
    kitchenOfferingId: 'selected',
    kitchenOfferingName: 'Pickup',
    customer: {},
    requestedFor: '',
    orderTypeConfig: {
      type: 'collection',
      scheduled_confirmation: 'automatic',
    },
    collection: { mode: 'scheduled', requested_for: '2026-09-29T16:00' },
  }
  const resolve = (cmd) =>
    resolveMenuOrderFulfilment({
      command: cmd,
      context: {},
      currencyCode: 'CHF',
      ordering: {},
      subtotal: 13,
    })
  const result = await resolve(command)
  assert.equal(result.status, 'pending_acceptance')
  assert.equal(result.payment.status, 'not_required')
  assert.equal(result.payment.method, undefined)
  assert.equal(result.payment.flow, 'confirmation_first')
  assert.equal(
    (await resolve({ ...command, collection: { mode: 'queue' } })).status,
    'pending_acceptance'
  )
  assert.equal(
    (await resolve({ ...command, orderTypeConfig: { type: 'collection' } }))
      .status,
    'pending_acceptance'
  )
})

test('customer status distinguishes waiting, confirmed pickup time and preparation', async () => {
  const { readFileSync } = await import('node:fs')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const { computed } = await import('vue')
  const script = readFileSync(
    new URL('../runtime/menu/components/Order/Status.vue', import.meta.url),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const props = {
    order: { status: 'pending_acceptance' },
    status: null,
    orderType: 'collection',
    fulfilmentTerm: 'Pickup',
    fulfilmentLabel: 'Tuesday 16:00',
    paymentLabel: 'Pay at pickup',
  }
  const view = compileFunction(
    `${stripTypeScriptTypes(script)}; return { title, description, eyebrow }`,
    ['computed', 'defineProps', 'defineEmits']
  )(
    computed,
    () => props,
    () => {}
  )
  assert.equal(view.title.value, 'Waiting for the Kitchen to accept')
  // Recreate the computed view for each server-provided lifecycle state.
  const render = (status) =>
    compileFunction(
      `${stripTypeScriptTypes(script)}; return { title: title.value, description: description.value }`,
      ['computed', 'defineProps', 'defineEmits']
    )(
      computed,
      () => ({ ...props, status: { status } }),
      () => {}
    )
  assert.match(render('scheduled').title, /confirmed: Tuesday 16:00/)
  assert.match(render('scheduled').description, /Preparation has not started/)
  assert.equal(render('accepted').description, 'Tuesday 16:00')
})

test('closed hours block ASAP but allow future slots; opening does not change lifecycle gates', () => {
  const original = now
  try {
    now = new Date('2026-09-28T10:00:00Z') // Monday closed
    assert.throws(
      () =>
        validateMenuOrderSchedule({ ...base, collection: { mode: 'queue' } }),
      /unavailable/
    )
    const future = menuOrderTimeOptions({ ...base, now }).days.flatMap(
      (day) => day.slots
    )[0].requestedFor
    assert.doesNotThrow(() => validateMenuOrderSchedule(scheduled(future)))
    now = new Date('2026-09-29T15:00:00Z') // Tuesday serving
    assert.doesNotThrow(() =>
      validateMenuOrderSchedule({ ...base, collection: { mode: 'queue' } })
    )
    for (const mode of ['queue', 'scheduled']) {
      const order = {
        status: 'pending_acceptance',
        order_type: 'collection',
        collection: { mode },
        payment: {
          flow: 'confirmation_first',
          status: 'not_required',
          required: false,
        },
      }
      assert.equal(
        buildKitchenOrderTransitionPatch(order, 'accept').status,
        'awaiting_payment_choice'
      )
      assert.throws(() =>
        buildKitchenOrderTransitionPatch(order, 'start_preparation')
      )
    }
  } finally {
    now = original
  }
})
test('Zurich midnight and daylight-saving boundary produce only server-offered slots', () => {
  const original = now
  try {
    for (const instant of [
      '2026-09-28T22:30:00Z',
      '2026-10-25T00:30:00Z',
      '2026-10-25T01:30:00Z',
    ]) {
      now = new Date(instant)
      const offered = menuOrderTimeOptions({ ...base, now }).days.flatMap(
        (day) => day.slots
      )
      assert.ok(offered.length)
      assert.doesNotThrow(() =>
        validateMenuOrderSchedule(scheduled(offered[0].requestedFor))
      )
    }
  } finally {
    now = original
  }
})
