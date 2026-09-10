import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

test('Kitchen detail reads only its exact associated ID and clears stale account data', () => {
  const page = readFileSync(
    new URL(
      '../runtime/pages/workspace/kitchen/[kitchenId].vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = page
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .* from .*\n/gm, '')
  const session = {
    pending: ref(true),
    error: ref(null),
    appUser: ref({ kitchens: ['requested', 'other'] }),
  }
  const id = ref('requested')
  const read = { kitchen: ref(null), pending: ref(false), error: ref(null) }
  let requested
  const dependencies = {
    computed,
    useAppSession: () => session,
    useRouteParam: () => id,
    useKitchenRead: (value) => {
      requested = value
      return read
    },
    definePageMeta: () => {},
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(script)}; return { kitchen, loading, error }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  assert.equal(requested.value, '')
  assert.equal(state.loading.value, true)
  session.pending.value = false
  assert.equal(requested.value, 'requested')
  read.kitchen.value = { id: 'other' }
  assert.equal(state.kitchen.value, null)
  read.kitchen.value = { id: 'requested' }
  assert.equal(state.kitchen.value.id, 'requested')
  session.appUser.value = { kitchens: ['other'] }
  assert.equal(requested.value, '')
  assert.equal(state.kitchen.value, null)
  id.value = 'other'
  assert.equal(requested.value, 'other')
  read.error.value = new Error('Read failed')
  assert.equal(state.error.value.message, 'Read failed')
  session.error.value = new Error('Membership failed')
  assert.equal(requested.value, '')
  assert.equal(state.error.value.message, 'Membership failed')
})
