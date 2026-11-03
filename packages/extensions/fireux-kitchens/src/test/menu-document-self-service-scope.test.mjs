import assert from 'node:assert/strict'
import test from 'node:test'
import {
  computed,
  ref,
  reactive,
  watch,
  effectScope,
  onScopeDispose,
  nextTick,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'

const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const settle = () => new Promise((resolve) => setImmediate(resolve))
const menu = (document) => ({
  kitchenId: 'guest',
  menuId: 'main-id',
  venue: 'TEST Café',
  name: 'Main',
  status: document ? 'published' : 'draft',
  revision: document ? 'saved' : '',
  previewUrl: '/api/menus/main/file?kitchenSlug=guest',
  document: document
    ? {
        url: 'https://files.example/menu.pdf',
        name: 'menu.pdf',
        type: 'application/pdf',
      }
    : null,
  menuPath: '/kitchens/guest/menus/main',
  qrPath: '/kitchens/guest/menus/main/qr',
  menus: [{ value: 'main-id', label: 'Main' }],
})
function fixture({ guest = false, claimLock } = {}) {
  const credential = deferred(),
    read = deferred(),
    write = deferred()
  const readCalled = deferred(),
    writeCalled = deferred(),
    scope = effectScope()
  const calls = [],
    starts = [],
    revoked = [],
    storage = new Map()
  const route = reactive({ path: '/menu-express', query: {}, hash: '' })
  const currentUser = ref({
    uid: 'guest',
    isAnonymous: guest,
    getIdToken: async () => {
      await credential.promise
      return 'fixture'
    },
  })
  const appUser = ref(null),
    config = reactive({ appId: 'app' })
  const auth = { currentUser, isAuthenticated: ref(!guest) }
  class FixtureURL extends URL {
    static createObjectURL() {
      return 'blob:fixture'
    }
    static revokeObjectURL(value) {
      revoked.push(value)
    }
  }
  const deps = {
    computed,
    ref,
    watch,
    onScopeDispose,
    useCommandScope,
    onMounted: (callback) => {
      void callback()
    },
    useRoute: () => route,
    navigateTo: async (destination) => {
      route.hash = destination.hash
    },
    useAuth: () => auth,
    useUserSession: () => ({ appUser }),
    useFireUXConfig: () => config,
    useKitchenTargets: () => ({ kitchens: ref([]), pending: ref(false) }),
    useKitchenCreate: () => ({
      createKitchenShell: async () => ({ kitchen_id: 'guest' }),
    }),
    URL: FixtureURL,
    location: { origin: 'http://localhost:3001' },
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    navigator: {
      locks: {
        request: async (_, run) => {
          if (claimLock) await claimLock.promise
          return run()
        },
      },
    },
    crypto,
    $fetch: async (path, options) => {
      if (path === '/api/kitchens/onboarding/guest') {
        starts.push({ path, options })
        return { kitchen_id: currentUser.value.uid }
      }
      calls.push({ path, options })
      ;(path.endsWith('/read') ? readCalled : writeCalled).resolve()
      return path.endsWith('/read') ? read.promise : write.promise
    },
  }
  Object.assign(
    deps,
    load('menu/composables/useMenuEditorScope', 'useMenuEditorScope', deps),
    load(
      'kitchen/utils/guest-kitchen-claim',
      'readGuestKitchenClaim,rememberGuestKitchenClaim,restoreGuestKitchenClaim',
      deps,
      (source) => source.replaceAll('import.meta.client', 'true')
    )
  )
  const flow = scope.run(() =>
    load(
      'menu/composables/useMenuDocument',
      'useMenuDocument',
      deps,
      (source) => source.replaceAll('import.meta.client', 'true')
    ).useMenuDocument()
  )
  flow.venue.value = 'TEST Café'
  flow.file.value = new File(['%PDF-one'], 'menu.pdf', {
    type: 'application/pdf',
  })
  return {
    flow,
    route,
    starts,
    currentUser,
    appUser,
    config,
    scope,
    calls,
    revoked,
    credential,
    read,
    write,
    readCalled,
    writeCalled,
  }
}

test(
  'publish sends one explicit scoped document and clears the preview without losing its result',
  { timeout: 1500 },
  async () => {
    const h = fixture(),
      pending = h.flow.publish()
    h.credential.resolve()
    await h.readCalled.promise
    h.read.resolve(menu(false))
    await h.writeCalled.promise
    assert.equal(h.calls.length, 2)
    const body = h.calls[1].options.body
    assert.equal(body.get('menuId'), 'main-id')
    assert.equal(body.get('revision'), '')
    assert.equal(body.get('file').name, 'menu.pdf')
    h.write.resolve(menu(true))
    await pending
    assert.equal(h.flow.data.value.menuId, 'main-id')
    assert.equal(
      h.flow.preview.value.file.url,
      '/api/menus/main/file?kitchenSlug=guest'
    )
    assert.equal(h.flow.file.value, null)
    assert.equal(h.flow.busy.value, false)
    assert.equal(h.flow.message.value, 'Your Menu is online.')
    await nextTick()
    assert.deepEqual(h.revoked, ['blob:fixture'])
    h.scope.stop()
  }
)

const changes = [
  (h) => {
    h.currentUser.value = { uid: 'another' }
  },
  (h) => {
    h.appUser.value = { role: 'user', created: { at: 2 } }
  },
  (h) => {
    h.config.appId = 'another-app'
  },
  (h) => {
    h.flow.kitchenChoice.value = 'another-kitchen'
  },
  (h) => {
    h.route.hash = '#recovery-context'
  },
  (h) => {
    h.flow.menuChoice.value = 'another-menu'
  },
  (h) => {
    h.flow.file.value = new File(['replacement'], 'another.pdf')
  },
  (h) => {
    h.flow.venue.value = 'Changed venue'
  },
  (h) => h.scope.stop(),
]
for (const stage of ['credential', 'read', 'write'])
  test(
    `obsolete ${stage} continuations cannot dispatch later work or replace the current view`,
    { timeout: 1500 },
    async () => {
      for (const change of changes) {
        const h = fixture(),
          pending = h.flow.publish()
        if (stage !== 'credential') {
          h.credential.resolve()
          await h.readCalled.promise
        }
        if (stage === 'write') {
          h.read.resolve(menu(false))
          await h.writeCalled.promise
        }
        change(h)
        h.credential.resolve()
        h.read.resolve(menu(false))
        h.write.resolve(menu(true))
        await pending
        assert.equal(
          h.calls.filter((call) => !call.path.endsWith('/read')).length,
          stage === 'write' ? 1 : 0
        )
        assert.notEqual(h.flow.data.value?.status, 'published')
        assert.equal(h.flow.message.value, '')
        h.scope.stop()
      }
    }
  )

test('a newer saved revision is never silently overwritten by an old preview', async () => {
  const h = fixture()
  h.flow.kitchenChoice.value = 'guest'
  h.credential.resolve()
  await h.readCalled.promise
  h.read.resolve(menu(true))
  await settle()
  h.flow.data.value = { ...menu(true), revision: 'old' }
  const pending = h.flow.publish()
  await pending
  assert.equal(h.calls.length, 2)
  assert.ok(h.calls.every((call) => call.path.endsWith('/read')))
  assert.match(h.flow.error.value, /Menu changed/)
  assert.ok(h.flow.file.value)
  h.scope.stop()
})

test('a double click dispatches only one publication', async () => {
  const h = fixture()
  const first = h.flow.publish()
  await h.flow.publish()
  h.credential.resolve()
  await h.readCalled.promise
  h.read.resolve(menu(false))
  await h.writeCalled.promise
  h.write.resolve(menu(true))
  await first
  assert.equal(h.calls.length, 2)
  assert.equal(h.flow.data.value.status, 'published')
  h.scope.stop()
})

test('switching Kitchen clears the old Kitchen Menu selection before reading the new target', async () => {
  const h = fixture()
  h.flow.menuChoice.value = 'previous-kitchen-menu'
  await nextTick()
  h.credential.resolve()
  h.flow.kitchenChoice.value = 'another-kitchen'
  await h.readCalled.promise
  assert.equal(h.flow.menuChoice.value, '')
  assert.equal(h.calls[0].options.body.kitchenId, 'another-kitchen')
  assert.equal(h.calls[0].options.body.menuId, undefined)
  h.scope.stop()
  h.read.resolve(menu(true))
})

test('recovery in the same Kitchen clears a previous Menu choice and reloads its scoped target', async () => {
  const h = fixture()
  h.credential.resolve()
  h.flow.kitchenChoice.value = 'guest'
  h.flow.menuChoice.value = 'previous-choice'
  await h.readCalled.promise
  h.read.resolve(menu(true))
  await settle()
  h.route.hash = `#kitchen=guest&key=${'a'.repeat(64)}`
  await settle()
  assert.equal(h.flow.menuChoice.value, '')
  assert.equal(h.calls.at(-1).options.body.menuId, undefined)
  assert.equal(h.calls.length, 2)
  h.scope.stop()
})

async function publishGuest(h) {
  const pending = h.flow.publish()
  h.credential.resolve()
  h.read.resolve(menu(false))
  h.write.resolve(menu(true))
  await pending
}

test('an obsolete guest claim cannot change the current target or start Kitchen creation', async () => {
  const claimLock = deferred()
  const h = fixture({ guest: true, claimLock })
  const pending = h.flow.publish()
  h.credential.resolve()
  await settle()
  h.currentUser.value = { uid: 'another', isAnonymous: false }
  claimLock.resolve()
  await pending
  assert.equal(h.flow.kitchenId.value, '')
  assert.equal(h.flow.recoveryLink.value, '')
  assert.equal(h.starts.length, 0)
  assert.equal(h.calls.length, 0)
  h.scope.stop()
})

test('opening another private recovery link selects that Menu instead of a previous Kitchen', async () => {
  const h = fixture({ guest: true })
  await publishGuest(h)
  assert.equal(h.flow.kitchenId.value, 'guest')
  h.flow.kitchenChoice.value = 'previous-selection'
  h.route.hash = `#kitchen=guest-recovered&key=${'b'.repeat(64)}`
  await nextTick()
  assert.equal(h.flow.kitchenId.value, 'guest-recovered')
  assert.equal(h.flow.kitchenChoice.value, '')
  assert.equal(h.route.hash, '')
  assert.match(h.flow.recoveryLink.value, /kitchen=guest-recovered/)
  assert.equal(h.starts.length, 1, 'recovery does not create another Kitchen')
  h.scope.stop()
})

test('an invalid recovery link stays an explicit error and cannot replace retained proof', async () => {
  const h = fixture({ guest: true })
  await publishGuest(h)
  const previous = h.flow.recoveryLink.value
  h.route.hash = '#kitchen=another&key=invalid'
  await nextTick()
  assert.match(h.flow.error.value, /invalid/)
  assert.equal(h.flow.kitchenId.value, 'guest')
  assert.equal(h.flow.recoveryLink.value, previous)
  assert.equal(h.route.hash, '')
  h.scope.stop()
})
