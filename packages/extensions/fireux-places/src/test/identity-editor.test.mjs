import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import test from 'node:test'
const clean = (s) =>
  s.replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
const model = clean(
  readFileSync(
    new URL('../runtime/place/models/identity-edit.ts', import.meta.url),
    'utf8'
  )
)
const helpers = compileFunction(
  `${stripTypeScriptTypes(model)};return {readPlaceIdentity,identityDraft,placeIdentityPatch}`
)()
test('sparse identity patches preserve unrelated fields and allow optional clears', () => {
  const current = helpers.readPlaceIdentity({
    name: 'Venue',
    phone: '123',
    tagline: 'Keep',
  })
  const draft = helpers.identityDraft(current, { name: null, phone: '' })
  assert.deepEqual(helpers.placeIdentityPatch(current, draft), { phone: '' })
  for (const fields of [
    { name: '' },
    { website: 'javascript:alert(1)' },
    { email: 'broken' },
    { timezone: 'Mars/Base' },
    { default_currency_code: 'CH' },
  ])
    assert.throws(() =>
      helpers.placeIdentityPatch(current, { ...current, ...fields })
    )
})
test('the editor prepares without writing, saves one sparse patch, and retires stale or unauthorized drafts', async () => {
  const vue = readFileSync(
    new URL('../runtime/place/components/Edit/Identity.vue', import.meta.url),
    'utf8'
  )
  const source = clean(
    vue.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  )
  const props = reactive({
    place: { id: 'p', name: 'Venue', tagline: 'Keep' },
    canWrite: true,
  })
  const scope = effectScope(),
    currentUser = ref({ uid: 'actor' }),
    writes = []
  let exposed
  const deps = {
    computed,
    ref,
    watch,
    onScopeDispose,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    defineProps: () => props,
    defineEmits: () => () => {},
    defineExpose: (v) => {
      exposed = v
    },
    ...helpers,
    usePlaceUpdate: () => ({
      captureIntent: useCommandScope([currentUser]),
      updateIdentity: async (patch, ctx) => writes.push({ patch, ctx }),
    }),
  }
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)};return {save,error,draft,open}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  exposed.show({ tagline: 'Fresh pizza' })
  assert.equal(writes.length, 0)
  await state.save()
  assert.deepEqual(writes, [
    { patch: { tagline: 'Fresh pizza' }, ctx: { id: 'p' } },
  ])
  exposed.show({ tagline: 'Another' })
  props.place = { ...props.place, id: 'different' }
  assert.equal(state.open.value, false)
  await state.save()
  assert.equal(writes.length, 1)
  props.canWrite = false
  exposed.show({ tagline: 'Unauthorized' })
  assert.equal(state.open.value, false)
  await state.save()
  assert.equal(writes.length, 1)
  scope.stop()
})

test('prepared address edits review and save the directory locality in the same patch', () => {
  const current = helpers.readPlaceIdentity({
    name: 'Venue',
    formatted_address: 'Old street',
    short_address: 'Old city',
  })
  assert.deepEqual(
    helpers.placeIdentityPatch(current, {
      ...current,
      formatted_address: 'New street',
      short_address: 'New city',
    }),
    { formatted_address: 'New street', short_address: 'New city' }
  )
  assert.deepEqual(
    helpers.placeIdentityPatch(current, {
      ...current,
      formatted_address: 'New street',
    }),
    { formatted_address: 'New street', short_address: 'Old city' }
  )
  assert.throws(
    () =>
      helpers.placeIdentityPatch(current, {
        ...current,
        formatted_address: 'New street',
        short_address: '',
      }),
    /locality/
  )
})
