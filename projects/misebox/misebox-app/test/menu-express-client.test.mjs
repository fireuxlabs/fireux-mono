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

test('an obsolete intake validation failure cannot clear a later draft', async () => {
  const started = deferred(),
    response = deferred(),
    storage = new Map()
  const source = readFileSync(
    new URL('../app/components/MenuExpress/Intake.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.dev', 'true')
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
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)};return {form,submit,error}`,
      Object.keys(dependencies)
    )(...Object.values(dependencies))
  )
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
