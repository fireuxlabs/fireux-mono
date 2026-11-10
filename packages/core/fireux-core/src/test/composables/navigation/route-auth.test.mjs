import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, nextTick, ref, toValue, watch } from 'vue'
import {
  authRedirectPath,
  resolvePostAuthDestination,
} from '../../../runtime/user/utils/auth-redirect.ts'

function load(path, result, deps, { server = false, dev = true } = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.client', String(!server))
    .replaceAll('import.meta.server', String(server))
    .replaceAll('import.meta.dev', String(dev))
    .replace('export default ', 'const middleware = ')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source, { mode: 'transform' }) + ';return ' + result,
    Object.keys(deps)
  )(...Object.values(deps))
}
function authHarness(dependencies = {}) {
  let currentUser = null
  let next,
    fail,
    unsubscribed = 0,
    timers = 0
  const api = load(
    '../../../runtime/composables/navigation/route-auth.ts',
    '{resolveClientAuthState,createClientRouteCheck,enforceClientRouteAuth}',
    {
      watch,
      getApps: () => [{}],
      getApp: () => ({}),
      getAuth: () => ({ currentUser }),
      onAuthStateChanged: (_, success, error) => {
        next = success
        fail = error
        return () => unsubscribed++
      },
      setTimeout: () => {
        timers++
        return 1
      },
      doc: () => {},
      getDoc: () => {},
      getFirestore: () => {},
      ...dependencies,
    }
  )
  return {
    api,
    get timers() {
      return timers
    },
    get unsubscribed() {
      return unsubscribed
    },
    next: (user) => {
      currentUser = user
      next(user)
    },
    fail: () => fail(new Error('private-provider-detail')),
  }
}
const tick = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve()
}

test('slow initial Auth stays unresolved without a sign-out deadline, then restores the user', async () => {
  const h = authHarness()
  let settled = false
  const pending = h.api.resolveClientAuthState(1).then((result) => {
    settled = true
    return result
  })
  await tick()
  assert.equal(settled, false)
  assert.equal(h.timers, 0)
  h.next({ uid: 'user-A', isAnonymous: false })
  assert.deepEqual(await pending, { uid: 'user-A', isAuthenticated: true })
  assert.equal(h.unsubscribed, 1)
})
test('only settled guest or anonymous Auth proves sign-out', async () => {
  for (const user of [null, { uid: 'guest-A', isAnonymous: true }]) {
    const h = authHarness()
    const pending = h.api.resolveClientAuthState(2500)
    await tick()
    h.next(user)
    assert.equal((await pending).isAuthenticated, false)
    assert.equal(h.unsubscribed, 1)
  }
})
test('Auth errors remain sanitized failures, never guest state', async () => {
  const h = authHarness()
  const pending = h.api.resolveClientAuthState(2500)
  await tick()
  h.fail()
  await assert.rejects(pending, {
    message: 'Your sign-in could not be checked. Please try again.',
  })
  assert.equal(h.unsubscribed, 1)
})
test('leaving and returning to the same route still disposes obsolete Auth work', async () => {
  const h = authHarness()
  const router = { currentRoute: ref({ fullPath: '/dashboard' }) }
  const check = h.api.createClientRouteCheck(
    () => router.currentRoute.value.fullPath
  )
  const pending = h.api.resolveClientAuthState(2500, check.signal)
  await tick()
  router.currentRoute.value = { fullPath: '/' }
  router.currentRoute.value = { fullPath: '/dashboard' }
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(h.unsubscribed, 1)
  h.next({ uid: 'late-user', isAnonymous: false })
  check.dispose()
  assert.equal(h.unsubscribed, 1)
})
test('disposed checks remove their route watcher', () => {
  const h = authHarness()
  const router = { currentRoute: ref({ fullPath: '/dashboard' }) }
  const check = h.api.createClientRouteCheck(
    () => router.currentRoute.value.fullPath
  )
  check.dispose()
  assert.equal(check.signal.aborted, true)
})
function guardHarness({
  kind = 'auth',
  hydrating = false,
  admin = false,
} = {}) {
  const moves = [],
    errors = [],
    ready = []
  const path =
    kind === 'workspace'
      ? '/workspace/kitchen/menu/menus'
      : kind === 'dev'
        ? '/diagnostics/users'
        : '/dashboard/settings'
  const route = {
    path,
    fullPath: path + '?from=arrival#detail',
    query: {},
    meta: { requiresAuth: true, roles: admin ? ['admin'] : [] },
  }
  const router = { currentRoute: ref({ fullPath: route.fullPath }) }
  const config = {
    appId: 'app-A',
    developerId: 'user-A',
    workspaces: ['kitchen'],
  }
  let resolveAdmin
  const bindings = {
    defineNuxtRouteMiddleware: (f) => f,
    navigateTo: (target) => {
      moves.push(target)
      return target
    },
    useNuxtApp: () => ({ isHydrating: hydrating, runWithContext: (f) => f() }),
    useRouter: () => router,
    onNuxtReady: (f) => ready.push(f),
    showError: (error) => errors.push(error),
    useRuntimeConfig: () => ({ public: { fireux: { id: 'app-A' } } }),
    useFireUXConfig: () => config,
    workspaceFamilyFromRouteContext: () => 'kitchen',
    normalizeWorkspaceFamily: (value) => value,
    abortNavigation: (error) => {
      throw error
    },
    createError: (options) => options,
    authRedirectPath,
    getDoc: () =>
      new Promise((resolve) => {
        resolveAdmin = resolve
      }),
  }
  const h = authHarness(bindings)
  const guard = load(
    `../../../runtime/middleware/fireux-${kind === 'dev' ? 'diagnostics' : kind}.global.ts`,
    'middleware',
    { ...bindings, ...h.api }
  )
  return {
    ...h,
    route,
    router,
    moves,
    errors,
    ready,
    guard,
    admin: (result) =>
      resolveAdmin({ exists: () => result, data: () => ({ role: 'admin' }) }),
  }
}
for (const kind of ['auth', 'workspace', 'dev']) {
  test(`${kind} route cannot redirect after navigation while Auth is pending`, async () => {
    const h = guardHarness({ kind })
    const pending = h.guard(h.route)
    await tick()
    h.router.currentRoute.value = { fullPath: '/' }
    await pending
    h.next(null)
    assert.deepEqual(h.moves, [])
  })
  test(`${kind} settled guest retains the full destination`, async () => {
    const h = guardHarness({ kind })
    const pending = h.guard(h.route)
    await tick()
    h.next(null)
    await pending
    const target = h.moves[0]
    const destination =
      typeof target === 'string'
        ? new URL(target, 'http://localhost').searchParams.get('redirect')
        : target.query.redirect
    assert.equal(destination, h.route.fullPath)
  })
}
test('late admin check cannot redirect a newer public arrival', async () => {
  const h = guardHarness({ admin: true })
  const pending = h.guard(h.route)
  await tick()
  h.next({ uid: 'user-A', isAnonymous: false })
  await tick()
  h.router.currentRoute.value = { fullPath: '/' }
  h.admin(false)
  await pending
  assert.deepEqual(h.moves, [])
})
test('hydration defers Auth checking and reports a settled failure without an unhandled rejection', async () => {
  const h = guardHarness({ hydrating: true })
  await h.guard(h.route)
  h.ready[0]()
  await tick()
  h.fail()
  await tick()
  await tick()
  assert.equal(h.errors.length, 1)
  assert.deepEqual(h.moves, [])
})
test('public arrival does not start a protected Auth check', async () => {
  const h = guardHarness()
  await h.guard({ path: '/', fullPath: '/', meta: {} })
  assert.deepEqual(h.moves, [])
})

test('Dashboard auth hydration preserves the original protected destination even if another guard already navigated', async () => {
  const route = ref({ fullPath: '/dashboard/settings?from=account' })
  const hasAuthState = ref(false),
    isReady = ref(false),
    calls = [],
    scope = effectScope()
  const useAuthRedirect = load(
    '../../../runtime/composables/fireux/firebase/useAuthRedirect.ts',
    'useAuthRedirect',
    {
      onNuxtReady: () => {},
      useNuxtApp: () => ({ isHydrating: false }),
      computed,
      ref,
      toValue,
      watch,
      useRouter: () => ({
        currentRoute: route,
        replace: async (path) => calls.push(path),
      }),
      useAuth: () => ({
        isAuthenticated: ref(false),
        isReady,
        hasAuthState,
        lastBindError: ref(null),
      }),
      resolvePostAuthDestination,
      authRedirectPath,
    }
  )
  scope.run(() => useAuthRedirect())
  assert.equal(calls.length, 0)
  route.value = { fullPath: '/auth' }
  isReady.value = true
  hasAuthState.value = true
  await nextTick()
  assert.deepEqual(calls, [
    '/auth?redirect=%2Fdashboard%2Fsettings%3Ffrom%3Daccount',
  ])
  scope.stop()
})

test('production diagnostics is unavailable on server and client before auth', () => {
  for (const server of [false, true]) {
    const guard = load(
      '../../../runtime/middleware/fireux-diagnostics.global.ts',
      'middleware',
      {
        defineNuxtRouteMiddleware: (callback) => callback,
        createError: (error) => error,
        abortNavigation: (error) => error,
        enforceClientRouteAuth: () =>
          assert.fail('Unavailable route checked auth'),
      },
      { server, dev: false }
    )
    assert.equal(guard({ path: '/diagnostics/users' }).statusCode, 404)
    assert.equal(guard({ path: '/home' }), undefined)
  }
})

test('server auth policy does not acquire client session state', () => {
  const enforce = load(
    '../../../runtime/composables/navigation/route-auth.ts',
    'enforceClientRouteAuth',
    {
      useNuxtApp: () => {
        throw new Error('Client state acquired on server')
      },
    },
    { server: true }
  )
  assert.equal(
    enforce({ fullPath: '/dashboard', meta: { requiresAuth: true } }),
    undefined
  )
})

for (const kind of ['auth', 'workspace']) {
  test(`${kind} admin policy permits only current admin membership`, async () => {
    for (const allowed of [false, true]) {
      const h = guardHarness({ kind, admin: true })
      const pending = h.guard(h.route)
      await tick()
      h.next({ uid: 'user-A', isAnonymous: false })
      await tick()
      h.admin(allowed)
      await pending
      assert.deepEqual(h.moves, allowed ? [] : ['/dashboard'])
    }
  })
}
test('diagnostics uses the shared developer decision', async () => {
  for (const uid of ['user-A', 'other-user']) {
    const h = guardHarness({ kind: 'dev' })
    const pending = h.guard(h.route)
    await tick()
    h.next({ uid, isAnonymous: false })
    await pending
    assert.deepEqual(h.moves, uid === 'user-A' ? [] : ['/dashboard'])
  }
})
test('public Workspace arrival starts no sign-in check', async () => {
  const h = guardHarness({ kind: 'workspace' })
  h.route.meta.requiresAuth = false
  await h.guard(h.route)
  assert.deepEqual(h.moves, [])
  assert.equal(h.unsubscribed, 0)
})
test('Workspace hydration cannot start obsolete Auth work after the route changes', async () => {
  const h = guardHarness({ kind: 'workspace', hydrating: true })
  await h.guard(h.route)
  assert.equal(h.ready.length, 1)
  h.router.currentRoute.value = { fullPath: '/' }
  h.ready[0]()
  await tick()
  assert.deepEqual(h.moves, [])
  assert.equal(h.unsubscribed, 0)
})
test('live sign-out returns to the latest Dashboard destination and disposal stops redirects', async () => {
  const route = ref({ fullPath: '/dashboard/settings' })
  const authenticated = ref(true),
    calls = [],
    scope = effectScope()
  const useAuthRedirect = load(
    '../../../runtime/composables/fireux/firebase/useAuthRedirect.ts',
    'useAuthRedirect',
    {
      onNuxtReady: () => {},
      useNuxtApp: () => ({ isHydrating: false }),
      computed,
      ref,
      toValue,
      watch,
      useRouter: () => ({
        currentRoute: route,
        replace: async (path) => {
          calls.push(path)
          route.value = { fullPath: path }
        },
      }),
      useAuth: () => ({
        isAuthenticated: authenticated,
        isReady: ref(true),
        hasAuthState: ref(true),
        lastBindError: ref(null),
      }),
      resolvePostAuthDestination,
      authRedirectPath,
    }
  )
  scope.run(() => useAuthRedirect())
  route.value = { fullPath: '/dashboard/user-profile?tab=details#name' }
  await nextTick()
  assert.deepEqual(calls, [])
  authenticated.value = false
  await nextTick()
  assert.deepEqual(calls, [
    authRedirectPath('/dashboard/user-profile?tab=details#name'),
  ])
  scope.stop()
  route.value = { fullPath: '/dashboard/settings' }
  authenticated.value = true
  await nextTick()
  authenticated.value = false
  await nextTick()
  assert.equal(calls.length, 1)
})
