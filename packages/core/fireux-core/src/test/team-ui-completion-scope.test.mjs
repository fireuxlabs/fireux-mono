import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import {
  computed,
  ref,
  reactive,
  watch,
  effectScope,
  onScopeDispose,
} from 'vue'
const helper = readFileSync(
  new URL(
    '../runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(helper)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)
async function fixture(file, names, controllerFixture) {
  let resolve, reject
  const pending = new Promise((a, b) => {
      resolve = a
      reject = b
    }),
    events = [],
    toasts = []
  const account = controllerFixture?.currentUser ?? ref({ uid: 'actor' }),
    membership =
      controllerFixture?.appUser ?? ref({ created: { at: 'first' } }),
    config = controllerFixture?.config ?? reactive({ appId: 'app-a' })
  const props = reactive({
    member: { id: 'a', name: 'Before', userId: '' },
    available: ['update', 'delete'],
    active: true,
    open: true,
    initialName: 'Original',
    create: controllerFixture?.controller.primitives.create ?? (() => pending),
    updateMember:
      controllerFixture?.controller.primitives.update ?? (() => pending),
    removeMember:
      controllerFixture?.controller.primitives.delete ?? (() => pending),
  })
  const source = readFileSync(
    new URL('../runtime/workspace/components/Team/' + file, import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  const deps = {
    useAuth: () => ({ currentUser: account }),
    useAppSession: () => ({ appUser: membership }),
    useFireUXConfig: () => config,
    computed,
    ref,
    watch,
    onScopeDispose,
    useCommandScope,
    defineProps: () => props,
    defineEmits:
      () =>
      (...args) =>
        events.push(args),
    defineExpose() {},
    withDefaults: (value) => value,
    useToast: () => ({ add: (value) => toasts.push(value) }),
    useFetch: () => ({ data: ref({ items: [] }), error: ref(null) }),
  }
  const scope = effectScope(),
    state = await scope.run(() =>
      compileFunction(
        `return (async()=>{${stripTypeScriptTypes(source)};return {${names}}})()`,
        Object.keys(deps)
      )(...Object.values(deps))
    )
  return {
    account,
    membership,
    config,
    props,
    scope,
    state,
    resolve,
    reject,
    events,
    toasts,
  }
}
for (const outcome of ['success', 'failure']) {
  test(`Disposed Create person ${outcome} does not change its replacement editor`, async () => {
    const f = await fixture(
      'Crud/CreatePerson.vue',
      'submit,query,message,savingId'
    )
    const run = f.state.submit({ name: 'Original' }, 'named')
    f.scope.stop()
    outcome === 'success'
      ? f.resolve({ memberId: 'a', name: 'Original' })
      : f.reject(new Error('Old failure'))
    await run
    assert.deepEqual(f.events, [])
    assert.equal(f.state.message.value, '')
  })
  for (const file of ['UpdateForm.vue', 'Settings.vue'])
    test(`Disposed ${file} ${outcome} has no obsolete feedback`, async () => {
      const update = file === 'UpdateForm.vue',
        f = await fixture(file, update ? 'save,name,error' : 'remove,error')
      if (update) f.props.available = true
      const run = update ? f.state.save() : f.state.remove()
      f.scope.stop()
      outcome === 'success'
        ? f.resolve({ name: 'Before' })
        : f.reject(new Error('Old failure'))
      await run
      assert.deepEqual(f.events, [])
      assert.deepEqual(f.toasts, [])
      assert.equal(f.state.error.value, '')
    })
}
test('Closed Create modal rejects an obsolete child completion', async () => {
  const f = await fixture('Crud/Create.vue', 'created')
  f.props.open = false
  f.state.created({ memberId: 'a', name: 'A' })
  assert.deepEqual(f.events, [])
  assert.deepEqual(f.toasts, [])
  f.scope.stop()
})
