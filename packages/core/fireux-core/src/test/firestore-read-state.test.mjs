import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const enhance = load(
  '../runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
  'enhanceFirestoreRead',
  { computed, ref, unref }
)

for (const kind of ['document', 'collection']) {
  test(`${kind} exposes live values only with a settled valid read`, () => {
    const active = ref(true)
    const initial = kind === 'document' ? { id: 'a' } : [{ id: 'a' }]
    const binding = Object.assign(ref(initial), {
      pending: ref(false),
      error: ref(undefined),
      promise: ref(undefined),
      stop: () => {
        active.value = false
      },
    })
    const state = enhance(binding, { active, kind })
    assert.equal(state.outcome.value, 'ready')
    assert.deepEqual(state.value, initial)
    assert.equal(state.data, state)
    assert.equal(state.promise, binding.promise)
    binding.pending.value = true
    assert.equal(state.pending.value, true)
    assert.equal(state.value, undefined)
    const error = new Error('Permission withdrawn')
    binding.error.value = error
    assert.equal(state.outcome.value, 'error')
    assert.equal(state.pending.value, false)
    assert.equal(state.error.value, error)
    assert.equal(state.value, undefined)
    assert.deepEqual(binding.value, initial, 'do not mutate VueFire cache')
    active.value = false
    assert.equal(state.outcome.value, 'idle')
    assert.equal(state.error.value, undefined)
    assert.equal(state.value, undefined)
    active.value = true
    binding.pending.value = false
    binding.error.value = undefined
    const changed = kind === 'document' ? { id: 'b' } : [{ id: 'b' }]
    binding.value = changed
    assert.deepEqual(state.value, changed, 'updates flow without another read')
    binding.value = kind === 'document' ? undefined : []
    assert.equal(state.outcome.value, kind === 'document' ? 'missing' : 'empty')
    state.stop()
    assert.equal(state.outcome.value, 'idle')
  })
}

test('User directory cannot turn a failed collection into a self-only result', () => {
  const self = { id: 'self', handle: 'me' }
  const source = { users: ref([]), pending: ref(false), error: ref(null) }
  const useUsers = load('../runtime/user/composables/useUsers.ts', 'useUsers', {
    computed,
    useFireUXConfig: () => ({ appId: 'app', isTenant: false }),
    useUserCollection: () => source,
    isUserDirectoryEligible: () => true,
    useUserSession: () => ({
      user: ref(self),
      appUser: ref(null),
      appOutcome: ref('missing'),
    }),
  })
  const state = useUsers()
  assert.deepEqual(state.users.value, [self])
  source.error.value = new Error('Denied')
  assert.deepEqual(state.users.value, [])
  assert.equal(state.outcome.value, 'error')
  source.error.value = null
  source.pending.value = true
  assert.deepEqual(state.users.value, [])
  source.pending.value = false
  assert.deepEqual(state.users.value, [self])
})
