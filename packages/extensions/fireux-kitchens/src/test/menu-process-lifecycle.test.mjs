import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  reactive,
  toRef,
  watch,
  effectScope,
  onScopeDispose,
} from 'vue'
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const command = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .split('/** A single')[0]
  .replace(/^import[^\n]*\n/, '')
  .replace('export function', 'function')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(command)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)
function fixture(kind, holdToken = false) {
  const token = deferred(),
    calls = [],
    user = ref({
      uid: 'a',
      getIdToken: () => (holdToken ? token.promise : Promise.resolve('token')),
    })
  const props = reactive({
    appId: 'app',
    kitchenId: 'kitchen',
    menuId: 'menu',
    authToken: 'token',
    canWrite: true,
    canProcess: true,
    source: {
      id: 'source',
      ai_draft: { name: 'Menu', sections: [{ items: [{ name: 'Soup' }] }] },
    },
  })
  const emitted = [],
    scope = effectScope()
  const deps = {
    computed,
    ref,
    reactive,
    toRef,
    watch,
    onScopeDispose,
    defineProps: () => props,
    defineEmits:
      () =>
      (...args) =>
        emitted.push(args),
    useAuth: () => ({ currentUser: user }),
    useMenuEditorScope: (sources, reset) => {
      const all = [() => user.value?.uid, ...sources]
      watch(all, reset, { flush: 'sync' })
      return useCommandScope(all)
    },
    fetch: (...args) => {
      const response = deferred()
      calls.push({ args, response })
      return response.promise
    },
  }
  const path = kind === 'Apply' ? 'Review/Apply.vue' : 'Cost.vue'
  const script = readFileSync(
    new URL(
      `../runtime/kitchen/components/FoodAndDrink/Menus/Process/${path}`,
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[^\n]*\n/gm, '')
    .replaceAll('import.meta.client', 'true')
  const names =
    kind === 'Apply'
      ? 'confirmDraft,pending,error,confirmResult'
      : 'refreshEstimate,pending,error,estimate'
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(script)};return {${names}}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  return { state, props, user, calls, emitted, scope, token }
}
const settle = () => new Promise((done) => setImmediate(done))
const response = (payload, ok = true) => ({
  ok,
  status: ok ? 200 : 409,
  json: async () => payload,
})
test('Apply keeps current success and discards late success/error after target, account or disposal changes', async () => {
  for (const change of [
    null,
    (f) => {
      f.props.kitchenId = 'other'
    },
    (f) => {
      f.user.value = { uid: 'b' }
    },
    (f) => f.scope.stop(),
  ]) {
    for (const ok of [true, false]) {
      const f = fixture('Apply'),
        work = f.state.confirmDraft()
      change?.(f)
      f.calls[0].response.resolve(
        response({ message: 'saved', write: { slug: 'menu' } }, ok)
      )
      await work
      const current = !change
      assert.equal(f.emitted.length, current && ok ? 1 : 0)
      assert.equal(Boolean(f.state.error.value), current && !ok)
      assert.equal(Boolean(f.state.confirmResult.value), current && ok)
      f.scope.stop()
    }
  }
})
test('Cost prevents obsolete credential dispatch and late completion cannot release a newer estimate', async () => {
  const f = fixture('Cost', true)
  f.props.kitchenId = 'other'
  f.token.resolve('token')
  await settle()
  assert.equal(f.calls.length, 1)
  assert.equal(JSON.parse(f.calls[0].args[1].body).kitchenId, 'other')
  f.props.menuId = 'next'
  await settle()
  assert.equal(f.calls.length, 2)
  f.calls[0].response.resolve(response({ old: true }))
  await settle()
  assert.equal(f.state.estimate.value, null)
  assert.equal(f.state.pending.value, true)
  f.calls[1].response.resolve(response({ current: true }))
  await settle()
  assert.deepEqual(f.state.estimate.value, { current: true })
  assert.equal(f.state.pending.value, false)
  f.scope.stop()
})
test('Cost ignores errors after disposal', async () => {
  const f = fixture('Cost')
  await settle()
  f.scope.stop()
  f.calls[0].response.resolve(response({ message: 'old error' }, false))
  await settle()
  assert.equal(f.state.error.value, '')
  assert.equal(f.state.estimate.value, null)
})
