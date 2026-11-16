import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, nextTick, ref, watch } from 'vue'

const root = new URL('../../', import.meta.url)
const source = readFileSync(
  new URL('app/composables/useTourBooking.ts', root),
  'utf8'
)
const code = stripTypeScriptTypes(
  source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
)
const catalogue = stripTypeScriptTypes(
  readFileSync(new URL('app/content/tours.ts', root), 'utf8').replace(
    /^export /gm,
    ''
  )
)
const tours = compileFunction(`${catalogue}; return tours`)()
const confirmed = {
  booking: {
    id: 'test-confirmed',
    status: 'confirmed',
    groupSize: 3,
    totalPriceChf: 477,
    departureTime: '09:00',
    timeZone: 'Europe/Zurich',
  },
}
async function harness(fetchBooking) {
  const calls = []
  const data = ref(null),
    status = ref('idle'),
    error = ref(null)
  const useFetch = () => ({
    data,
    status,
    error,
    clear() {
      data.value = null
      status.value = 'idle'
    },
    async execute() {
      data.value = {
        available: true,
        availabilityRevision: 2,
        startAt: '2099-06-15T09:00:00+02:00',
        endAt: '2099-06-15T13:00:00+02:00',
        timeZone: 'Europe/Zurich',
      }
      status.value = 'success'
    },
  })
  const scope = effectScope()
  const factory = compileFunction(`${code}; return useTourBooking`, [
    'tours',
    'computed',
    'ref',
    'watch',
    'useRoute',
    'useFetch',
    '$fetch',
  ])
  const useTourBooking = factory(
    tours,
    computed,
    ref,
    watch,
    () => ({ query: { tour: 'interlaken-panorama', people: '3' } }),
    useFetch,
    (...args) => {
      calls.push(args)
      return fetchBooking(...args)
    }
  )
  const flow = scope.run(useTourBooking)
  flow.date.value = '2099-06-15'
  await nextTick()
  const input = {
    requestId: 'intent-one',
    slotId: flow.configuration.value.slots[0].id,
    contact: { name: 'Test Guest', email: 'guest@example.test' },
  }
  return { flow, input, calls, stop: () => scope.stop() }
}

test('tour links retain group selection and confirmed receipts retain host details', async () => {
  const h = await harness(async () => confirmed)
  try {
    assert.equal(h.flow.groupSize.value, 3)
    assert.equal(
      h.flow.configuration.value.slots[0].startAt,
      '2099-06-15T09:00'
    )
    const receipt = await h.flow.confirm.value(h.input)
    assert.equal(receipt.reference, 'test-confirmed')
    assert.deepEqual(
      Object.fromEntries(
        receipt.details.map(({ label, value }) => [label, value])
      ),
      {
        Tour: tours[0].name,
        Date: '2099-06-15',
        Departure: '09:00 (Europe/Zurich)',
        Group: '3 people',
        Total: 'CHF 477',
        'Meeting point': tours[0].meetingPoint,
      }
    )
    assert.equal(h.calls[0][1].body.availabilityRevision, 2)
    assert.equal(h.calls[0][1].body.groupSize, 3)
  } finally {
    h.stop()
  }
})

test('uncertain completion retains the submission and never automatically sends it twice', async () => {
  const h = await harness(async () => {
    throw new Error('connection lost')
  })
  try {
    const confirm = h.flow.confirm.value
    await assert.rejects(confirm(h.input), /may have been received/)
    await assert.rejects(confirm(h.input), /may have been received/)
    assert.throws(
      () => confirm({ ...h.input, requestId: 'different-intent' }),
      /already been sent/
    )
    assert.equal(h.calls.length, 1)
  } finally {
    h.stop()
  }
})

test('an id alone or a pending server record cannot become a confirmed receipt', async () => {
  for (const booking of [
    { id: 'pending' },
    { ...confirmed.booking, status: 'pending' },
    { ...confirmed.booking, totalPriceChf: NaN },
  ]) {
    const h = await harness(async () => ({ booking }))
    try {
      await assert.rejects(
        h.flow.confirm.value(h.input),
        /could not verify confirmation/
      )
    } finally {
      h.stop()
    }
  }
})
