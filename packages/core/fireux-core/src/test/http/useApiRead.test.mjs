import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  getCurrentInstance,
  onScopeDispose,
  ref,
  toValue,
  watch,
} from 'vue'
import {
  apiReadUrl,
  apiReadVersion,
  API_READ_ACCESS_HEADER,
  API_READ_VERSION_HEADER,
} from '../../runtime/utils/api-read-protocol.ts'
import { createApiReadRequests } from '../../runtime/composables/http/api-read-requests.ts'

const first = 'a'.repeat(64),
  second = 'b'.repeat(64)
const wait = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(predicate) {
  for (let count = 0; count < 100; count++) {
    if (predicate()) return
    await wait()
  }
  assert.fail('Expected keyed API read transition did not occur.')
}
function fixture({ hydrated = false } = {}) {
  const user = ref({ uid: 'actor', getIdToken: async () => 'private-token' })
  const states = new Map(),
    persisted = new Map(),
    channels = [],
    requests = []
  const backing = { value: 'Before', version: first, access: 'public' }
  const nuxtApp = { runWithContext: (run) => run() }
  let hold
  const manifests = ref(
    hydrated
      ? { public: [{ url: '/api/records', version: first, access: 'public' }] }
      : {}
  )
  persisted.set('fireux_api_read_manifests', manifests)
  function native(key) {
    if (!states.has(key)) {
      const data = ref(
        hydrated && key === 'public' ? { value: 'Before' } : undefined
      )
      const status = ref(data.value ? 'success' : 'idle'),
        error = ref()
      const entry = {
        data,
        status,
        error,
        pending: computed(() => status.value === 'pending'),
        generation: 0,
      }
      entry.clear = () => {
        entry.generation++
        entry.abort?.abort()
        entry.promise = undefined
        data.value = undefined
        error.value = undefined
        status.value = 'idle'
      }
      entry.refresh = ({ dedupe } = {}) => {
        if (entry.promise && dedupe === 'defer') return entry.promise
        entry.abort?.abort()
        const generation = ++entry.generation,
          controller = new AbortController()
        entry.abort = controller
        status.value = 'pending'
        entry.promise = Promise.resolve()
          .then(() => entry.handler(nuxtApp, { signal: controller.signal }))
          .then((value) => {
            if (generation === entry.generation) {
              data.value = value
              error.value = undefined
              status.value = 'success'
            }
          })
          .catch((cause) => {
            if (generation === entry.generation) {
              error.value = cause
              status.value = 'error'
            }
          })
          .finally(() => {
            if (generation === entry.generation) entry.promise = undefined
          })
        return entry.promise
      }
      states.set(key, entry)
    }
    return states.get(key)
  }
  const useAsyncData = (key, handler, options = {}) => {
    const current = () => native(String(toValue(key)))
    current().handler = handler
    watch(
      () => String(toValue(key)),
      () => {
        current().handler = handler
        void current().refresh()
      }
    )
    if (options.watch)
      watch(options.watch, () => {
        current().handler = handler
        void current().refresh()
      })
    queueMicrotask(() => {
      if (!current().data.value && !current().promise) void current().refresh()
    })
    return {
      data: computed({
        get: () => current().data.value,
        set: (value) => {
          current().data.value = value
        },
      }),
      status: computed({
        get: () => current().status.value,
        set: (value) => {
          current().status.value = value
        },
      }),
      error: computed({
        get: () => current().error.value,
        set: (value) => {
          current().error.value = value
        },
      }),
      pending: computed(() => current().pending.value),
      clear: () => current().clear(),
      refresh: (input) => current().refresh(input),
    }
  }
  function fetcher(defaults = {}) {
    const raw = async (url, input = {}) => {
      const options = { ...defaults, ...input },
        snapshot = { ...backing }
      requests.push({ url, options })
      if (hold) await hold
      if (options.signal?.aborted)
        throw new DOMException('Aborted', 'AbortError')
      return {
        _data: { value: snapshot.value },
        headers: new Headers({
          [API_READ_ACCESS_HEADER]: snapshot.access,
          [API_READ_VERSION_HEADER]: snapshot.version,
        }),
      }
    }
    return Object.assign(async (url, input) => (await raw(url, input))._data, {
      raw,
      native: globalThis.fetch,
      create: (input) => fetcher({ ...defaults, ...input }),
    })
  }
  const connections = {
    identities: [],
    setIdentity(value) {
      this.identities.push(value)
    },
    subscribe(descriptor, callbacks) {
      const channel = { descriptor, callbacks, stopped: false }
      channels.push(channel)
      return {
        update: (version) => {
          channel.descriptor = { ...channel.descriptor, version }
        },
        stop: () => {
          channel.stopped = true
        },
      }
    },
  }
  const dependencies = {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    clearNuxtData: (keys) => {
      for (const key of keys) states.get(key)?.clear()
    },
    useAsyncData,
    useNuxtApp: () => nuxtApp,
    useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
    useState: (key, initialize) => {
      if (!persisted.has(key)) persisted.set(key, ref(initialize()))
      return persisted.get(key)
    },
    computed,
    getCurrentInstance,
    onScopeDispose,
    ref,
    toValue,
    watch,
    useAuth: () => ({ currentUser: user }),
    useFireUXConfig: () => ({ appId: 'app' }),
    API_READ_ACCESS_HEADER,
    API_READ_VERSION_HEADER,
    apiReadUrl,
    apiReadVersion,
    createApiReadConnections: () => connections,
    createApiReadRequests,
    $fetch: fetcher(),
    window: { location: { origin: 'http://fixture.local' } },
  }
  const source = readFileSync(
    new URL('../../runtime/composables/http/useApiRead.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  const useApiRead = compileFunction(
    stripTypeScriptTypes(source) + ';return useApiRead',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  function open(
    key = 'public',
    handler = ({ fetch }) => fetch('/api/records'),
    options
  ) {
    const scope = effectScope()
    const state = scope.run(() => useApiRead(key, handler, options))
    return { scope, state }
  }
  return {
    open,
    backing,
    requests,
    channels,
    states,
    user,
    manifests,
    connections,
    hold() {
      let release
      hold = new Promise((resolve) => {
        release = resolve
      })
      return () => {
        hold = undefined
        release()
      }
    },
  }
}

test('hydrated DTOs subscribe without refetching, then native refresh receives a remote change', async () => {
  const h = fixture({ hydrated: true }),
    reader = h.open()
  try {
    await until(() => h.channels.length === 1)
    assert.equal(h.requests.length, 0)
    assert.equal(reader.state.data.value.value, 'Before')
    h.backing.value = 'After'
    h.backing.version = second
    h.channels[0].callbacks.change(second)
    await until(() => reader.state.data.value?.value === 'After')
    assert.equal(h.requests.length, 1)
    assert.doesNotMatch(
      JSON.stringify(h.manifests.value),
      /private-token|authorization/
    )
  } finally {
    reader.scope.stop()
  }
  assert.equal(h.channels[0].stopped, true)
})

test('two components with one native key share a subscription and one refresh coordinator', async () => {
  const h = fixture(),
    firstReader = h.open(),
    secondReader = h.open()
  try {
    await until(
      () =>
        firstReader.state.data.value &&
        secondReader.state.data.value &&
        h.channels.length === 1
    )
    assert.equal(h.requests.length, 1)
    h.backing.value = 'After'
    h.backing.version = second
    h.channels[0].callbacks.change(second)
    await until(() => firstReader.state.data.value?.value === 'After')
    await wait(25)
    assert.equal(h.requests.length, 2)
    firstReader.scope.stop()
    assert.equal(h.channels[0].stopped, false)
  } finally {
    firstReader.scope.stop()
    secondReader.scope.stop()
  }
  assert.equal(h.channels[0].stopped, true)
})

test('an in-flight same-client refresh satisfies its matching live echo without a second GET', async () => {
  const h = fixture(),
    reader = h.open()
  try {
    await until(() => h.channels.length === 1 && reader.state.data.value)
    h.backing.value = 'After'
    h.backing.version = second
    const release = h.hold(),
      refresh = reader.state.refresh()
    await until(() => h.requests.length === 2)
    h.channels[0].callbacks.change(second)
    release()
    await refresh
    await until(() => reader.state.data.value?.value === 'After')
    await wait(25)
    assert.equal(h.requests.length, 2)
  } finally {
    reader.scope.stop()
  }
})

test('a refresh started before the remote change receives one necessary follow-up GET', async () => {
  const h = fixture(),
    reader = h.open()
  try {
    await until(() => h.channels.length === 1 && reader.state.data.value)
    const release = h.hold(),
      refresh = reader.state.refresh()
    await until(() => h.requests.length === 2)
    h.backing.value = 'After'
    h.backing.version = second
    h.channels[0].callbacks.change(second)
    release()
    await refresh
    await until(() => reader.state.data.value?.value === 'After')
    assert.equal(h.requests.length, 3)
  } finally {
    reader.scope.stop()
  }
})

test('a live refresh already in flight is shared when the write response requests native refresh', async () => {
  const h = fixture(),
    reader = h.open()
  try {
    await until(() => h.channels.length === 1 && reader.state.data.value)
    h.backing.value = 'After'
    h.backing.version = second
    const release = h.hold()
    h.channels[0].callbacks.change(second)
    await until(() => h.requests.length === 2)
    const refresh = reader.state.refresh()
    await wait()
    assert.equal(h.requests.length, 2)
    release()
    await refresh
    await until(() => reader.state.data.value?.value === 'After')
    await wait(25)
    assert.equal(h.requests.length, 2)
  } finally {
    reader.scope.stop()
  }
})

test('key changes suppress obsolete completions and disposal stops the last subscription', async () => {
  const h = fixture(),
    key = ref('first'),
    reader = h.open(key, ({ fetch }) => fetch(`/api/records/${key.value}`))
  try {
    await until(() => h.channels.length === 1 && reader.state.data.value)
    const release = h.hold(),
      refresh = reader.state.refresh()
    await until(() => h.requests.length === 2)
    h.backing.value = 'New scope'
    h.backing.version = second
    key.value = 'second'
    release()
    await refresh
    await until(() => reader.state.data.value?.value === 'New scope')
    assert.equal(h.channels[0].stopped, true)
    assert.equal(h.channels.filter((channel) => !channel.stopped).length, 1)
  } finally {
    reader.scope.stop()
  }
  assert.equal(
    h.channels.every((channel) => channel.stopped),
    true
  )
})

test('revocation clears protected data and identity changes clear the cached native key', async () => {
  const h = fixture()
  h.backing.access = 'protected'
  const reader = h.open('protected', async ({ fetch }) => {
    const user = h.user.value
    if (!user) throw Object.assign(new Error('Sign in.'), { statusCode: 401 })
    return fetch('/api/protected', {
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
  })
  try {
    await until(() => h.channels.length === 1 && reader.state.data.value)
    h.channels[0].callbacks.error({
      type: 'error',
      id: 'one',
      statusCode: 403,
      message: 'Access removed.',
      retryable: false,
    })
    assert.equal(reader.state.data.value, undefined)
    assert.equal(reader.state.error.value.statusCode, 403)
    await reader.state.refresh()
    assert.ok(reader.state.data.value)
    h.user.value = null
    assert.equal(h.states.get('protected').data.value, undefined)
    await until(() => reader.state.error.value?.statusCode === 401)
    assert.equal(
      h.channels.every((channel) => channel.stopped),
      true
    )
  } finally {
    reader.scope.stop()
  }
})

test('an undeclared owned API cannot silently fall back to one-shot acquisition', async () => {
  const h = fixture()
  h.backing.access = 'undeclared'
  const reader = h.open()
  try {
    await until(() => reader.state.error.value)
    assert.match(reader.state.error.value.message, /declare a live projection/)
    assert.equal(h.channels.length, 0)
    assert.equal(reader.state.data.value, undefined)
  } finally {
    reader.scope.stop()
  }
})
