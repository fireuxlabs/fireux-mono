import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
const load = (file, names, deps) => {
  const code = readFileSync(
    new URL(`../runtime/${file}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function fixture() {
  const id = ref('reservation-501'),
    currentUser = ref({ uid: 'user-a', getIdToken: async () => 'local-token' })
  const runtime = {
    id: ref('property-a'),
    canRead: ref(true),
    canWrite: ref(true),
    targetOutcome: ref('ready'),
  }
  const state = {
    data: ref(null),
    pending: ref(true),
    error: ref(null),
    refresh: () => {},
  }
  const requests = []
  let handler
  const { usePropertyReservation } = load(
    'property/composables/reservations/usePropertyReservation.ts',
    'usePropertyReservation',
    {
      computed,
      toValue,
      resolveReadOutcome,
      useAuth: () => ({ currentUser }),
      useRequireUser: async () => currentUser.value,
      useFireUXConfig: () => ({ appId: 'buenohost' }),
      useActiveProperty: () => runtime,
      useLiveAsyncData: (_key, fn) => {
        handler = fn
        return state
      },
    }
  )
  const detail = usePropertyReservation(id)
  const fetch = async () => {
    state.data.value = await handler(async (url, options) => {
      requests.push({ url, options })
      return {
        reservation: {
          id: id.value,
          property_id: runtime.id.value,
          notes: 'Current record',
        },
      }
    })
    state.pending.value = false
    state.error.value = null
  }
  return { id, currentUser, runtime, state, detail, fetch, requests }
}
test('detail requests exact authorized record beyond list cap and follows current scope', async () => {
  const f = fixture()
  await f.fetch()
  assert.equal(
    f.requests[0].url,
    '/api/workspace/properties/property-a/reservations/reservation-501'
  )
  assert.equal(
    f.requests[0].options.headers.Authorization,
    'Bearer local-token'
  )
  assert.equal(f.detail.reservation.value.id, 'reservation-501')
  f.id.value = 'reservation-700'
  assert.equal(f.detail.reservation.value, null)
  assert.equal(f.detail.outcome.value, 'pending')
  await f.fetch()
  f.runtime.id.value = 'property-b'
  assert.equal(f.detail.reservation.value, null)
  await f.fetch()
  assert.equal(f.detail.reservation.value.property_id, 'property-b')
  f.currentUser.value = { uid: 'user-b', getIdToken: async () => 'local-token' }
  assert.equal(f.detail.reservation.value, null)
  await f.fetch()
  f.state.data.value.reservation.notes = 'Live update'
  assert.equal(f.detail.reservation.value.notes, 'Live update')
})
test('missing, denial, failure and access revocation hide detail and block edits', async () => {
  const f = fixture()
  await f.fetch()
  for (const statusCode of [404, 403, 503]) {
    f.state.error.value = { statusCode }
    assert.equal(
      f.detail.outcome.value,
      statusCode === 404 ? 'missing' : 'error'
    )
    assert.equal(f.detail.reservation.value, null)
    assert.equal(f.detail.canWrite.value, false)
  }
  f.state.error.value = null
  f.runtime.canRead.value = false
  assert.equal(f.detail.outcome.value, 'denied')
  const before = f.requests.length
  await f.fetch()
  assert.equal(f.requests.length, before)
  f.runtime.canRead.value = true
  await f.fetch()
  assert.equal(f.detail.outcome.value, 'ready')
  f.runtime.targetOutcome.value = 'pending'
  assert.equal(f.detail.pending.value, true)
})
test('existing exact server GET reads only requested document and retains authority boundary', async () => {
  const paths = []
  let allowed = true
  const { getReservation } = load(
    'property/server/operations/reservations/read.ts',
    'getReservation',
    {
      requireReservationActor: async () => {
        if (!allowed)
          throw Object.assign(new Error('Forbidden'), { statusCode: 403 })
        return {
          propertyId: 'property-a',
          db: {
            doc: (path) => {
              paths.push(path)
              return {
                get: async () => ({
                  exists: true,
                  id: 'reservation-501',
                  data: () => ({ property_id: 'property-a' }),
                }),
              }
            },
          },
        }
      },
      canonicalReservation: (id, data) => ({ id, ...data }),
      reservationFail: (statusCode, message) => {
        throw Object.assign(new Error(message), { statusCode })
      },
    }
  )
  assert.equal(
    (await getReservation({}, 'property-a', 'reservation-501')).reservation.id,
    'reservation-501'
  )
  assert.deepEqual(paths, [
    'properties/property-a/reservations/reservation-501',
  ])
  allowed = false
  await assert.rejects(getReservation({}, 'property-a', 'reservation-501'), {
    statusCode: 403,
  })
  assert.equal(paths.length, 1)
})
