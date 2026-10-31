import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { webcrypto } from 'node:crypto'
import {
  ref,
  reactive,
  shallowRef,
  computed,
  watch,
  toValue,
  effectScope,
  onScopeDispose,
} from 'vue'

const load = (file, deps, result) => {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.client', 'true')
    .replaceAll('import.meta.dev', 'true')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../packages/core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  { watch, onScopeDispose },
  'useCommandScope'
)
const deferred = () => {
  let resolve, reject
  const promise = new Promise((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}
function fixture({ holdCredentials = false } = {}) {
  const credential = deferred(),
    credentialStarted = deferred(),
    response = deferred(),
    requestStarted = deferred(),
    nextResponse = deferred(),
    nextRequestStarted = deferred()
  const user = shallowRef({
    uid: 'user-a',
    isAnonymous: false,
    getIdToken: () => {
      credentialStarted.resolve()
      return holdCredentials
        ? credential.promise
        : Promise.resolve('fixture-token')
    },
  })
  const id = ref('11111111-1111-4111-8111-111111111111'),
    calls = [],
    storage = new Map()
  const useMenuExpressRequest = load(
    '../app/composables/useMenuExpressRequest.ts',
    {
      ref,
      computed,
      watch,
      toValue,
      useCommandScope,
      onMounted: (callback) => callback(),
      useAuth: () => ({ currentUser: user }),
      localStorage: {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      $fetch: (path, options) => {
        calls.push({ path, options })
        if (calls.length === 1) {
          requestStarted.resolve()
          return response.promise
        }
        nextRequestStarted.resolve()
        return nextResponse.promise
      },
    },
    'useMenuExpressRequest'
  )
  const scope = effectScope(),
    state = scope.run(() => useMenuExpressRequest(id))
  state.token.value = 'a'.repeat(64)
  return {
    state,
    scope,
    user,
    id,
    calls,
    storage,
    credential,
    credentialStarted,
    response,
    requestStarted,
    nextResponse,
    nextRequestStarted,
  }
}

test('request/account/token changes before credentials prevent obsolete dispatch', async () => {
  for (const change of [
    (f) => {
      f.id.value = '22222222-2222-4222-8222-222222222222'
    },
    (f) => {
      f.user.value = { ...f.user.value, uid: 'user-b' }
    },
    (f) => {
      f.state.token.value = 'b'.repeat(64)
    },
  ]) {
    const f = fixture({ holdCredentials: true })
    const action = f.state.act('approve')
    await f.credentialStarted.promise
    change(f)
    f.credential.resolve('fixture-token')
    assert.equal(await action, false)
    assert.equal(f.calls.length, 0)
    assert.equal(f.state.error.value, '')
    assert.equal(f.state.busy.value, false)
    f.scope.stop()
  }
})

test('an obsolete response cannot populate the next account view or release its pending read', async () => {
  const f = fixture()
  const oldRead = f.state.recover()
  await f.requestStarted.promise
  f.user.value = { ...f.user.value, uid: 'user-b' }
  f.state.token.value = 'a'.repeat(64)
  const currentRead = f.state.recover()
  await f.nextRequestStarted.promise
  f.response.resolve({
    request: {
      id: f.id.value,
      venue: 'OLD',
      createdAt: new Date().toISOString(),
    },
    messages: [],
  })
  assert.equal(await oldRead, false)
  assert.equal(f.state.request.value, null)
  assert.equal(f.state.busy.value, true)
  assert.equal(f.state.error.value, '')
  assert.equal(f.storage.size, 0)
  f.nextResponse.resolve({
    request: {
      id: f.id.value,
      venue: 'CURRENT',
      createdAt: new Date().toISOString(),
    },
    messages: [],
  })
  assert.equal(await currentRead, true)
  assert.equal(f.state.request.value.venue, 'CURRENT')
  assert.equal(f.state.busy.value, false)
  f.scope.stop()
})

test('scope disposal stops later dispatch and normal recovery still uses one reader', async () => {
  const disposed = fixture({ holdCredentials: true })
  const old = disposed.state.recover()
  await disposed.credentialStarted.promise
  disposed.scope.stop()
  disposed.credential.resolve('fixture-token')
  assert.equal(await old, false)
  assert.equal(disposed.calls.length, 0)
  const f = fixture(),
    read = f.state.recover()
  await f.requestStarted.promise
  f.response.resolve({
    request: { id: f.id.value, createdAt: new Date().toISOString() },
    messages: [],
  })
  assert.equal(await read, true)
  assert.equal(f.calls.length, 1)
  assert.equal(f.state.request.value.id, f.id.value)
  assert.equal(f.storage.size, 1)
  assert.equal(f.state.busy.value, false)
  f.scope.stop()
})

test('a committed message or action stays successful when its follow-up read fails', async () => {
  for (const save of [
    (state) => state.send('TEST message'),
    (state) => state.act('approve'),
  ]) {
    const f = fixture()
    const saved = save(f.state)
    await f.requestStarted.promise
    f.response.resolve({ success: true })
    await f.nextRequestStarted.promise
    f.nextResponse.reject(new Error('Read transport unavailable'))
    assert.equal(await saved, true)
    assert.match(f.state.error.value, /change was saved/)
    assert.match(f.state.error.value, /do not submit it again/)
    assert.equal(f.state.busy.value, false)
    assert.equal(f.calls.length, 2)
    f.scope.stop()
  }
})

test('a failed write stays failed and never attempts a follow-up read', async () => {
  const f = fixture()
  const sent = f.state.send('TEST message')
  await f.requestStarted.promise
  f.response.reject(new Error('Write rejected'))
  assert.equal(await sent, false)
  assert.equal(f.state.error.value, 'Write rejected')
  assert.equal(f.calls.length, 1)
  f.scope.stop()
})

function intakeFixture(dependencies) {
  const useMenuExpressIntake = load(
    '../app/composables/useMenuExpressIntake.ts',
    dependencies,
    'useMenuExpressIntake'
  )
  return useMenuExpressIntake()
}

test('source upload releases the native file selection so the same file can be retried', () => {
  const source = readFileSync(
    new URL('../app/components/MenuExpress/Sources.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/const props = defineProps<[\s\S]*?>\(\)/, '')
  const calls = []
  const selectFile = compileFunction(
    `${stripTypeScriptTypes(source)};return selectFile`,
    ['props']
  )({ state: { upload: (file) => calls.push(file) } })
  const file = { name: 'TEST-menu.pdf' }
  const input = { files: [file], value: 'TEST-menu.pdf' }
  selectFile({ target: input })
  assert.equal(input.value, '')
  input.value = 'TEST-menu.pdf'
  selectFile({ target: input })
  assert.deepEqual(calls, [file, file])
})

test('interrupted intake restores original details and retries the same request identity', async () => {
  const storage = new Map(),
    calls = [],
    destinations = []
  const scope = effectScope()
  const state = scope.run(() =>
    intakeFixture({
      ref,
      reactive,
      onMounted() {},
      useCommandScope,
      useAuth: () => ({ currentUser: shallowRef(null) }),
      crypto: webcrypto,
      localStorage: {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      $fetch: async (_path, options) => {
        calls.push(options.body)
        if (calls.length === 1) throw new Error('Response lost')
        return { id: options.body.id }
      },
      navigateTo: async (path) => destinations.push(path),
    })
  )
  Object.assign(state.form, {
    name: 'TEST',
    email: 'test@example.com',
    venue: 'Original',
    location: 'Test',
  })
  await state.submit()
  assert.equal(state.error.value, 'Response lost')
  state.form.venue = 'Changed after interruption'
  await state.submit()
  assert.equal(calls.length, 1)
  assert.match(state.error.value, /Restore submitted details/)
  state.restoreSubmission()
  assert.equal(state.form.venue, 'Original')
  await state.submit()
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[1], calls[0])
  assert.deepEqual(destinations, [`/menu-express/${calls[0].id}`])
  assert.equal(state.pendingInput.value, null)
  assert.equal(storage.has('misebox:menu-express:intake'), false)
  scope.stop()
})

test('an obsolete intake validation failure cannot clear a later draft', async () => {
  const started = deferred(),
    response = deferred(),
    storage = new Map()
  const dependencies = {
    ref,
    reactive,
    onMounted() {},
    useCommandScope,
    useAuth: () => ({ currentUser: shallowRef(null) }),
    crypto: webcrypto,
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    $fetch: () => {
      started.resolve()
      return response.promise
    },
    navigateTo: async () => {
      throw new Error('Must not navigate on a failed submission')
    },
  }
  const scope = effectScope()
  const state = scope.run(() => intakeFixture(dependencies))
  Object.assign(state.form, {
    name: 'TEST',
    email: 'test@example.com',
    venue: 'Original',
    location: 'Test',
  })
  const submission = state.submit()
  await started.promise
  state.form.venue = 'Changed'
  storage.set('misebox:menu-express:intake', 'LATER DRAFT')
  response.reject({ statusCode: 400, message: 'Previous validation failure' })
  await submission
  assert.equal(storage.get('misebox:menu-express:intake'), 'LATER DRAFT')
  assert.equal(state.error.value, '')
  scope.stop()
})
