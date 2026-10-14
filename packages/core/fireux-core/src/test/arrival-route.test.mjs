import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
import { resolvePostAuthDestination } from '../runtime/utils/onboarding-route.ts'

function load(path, result, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.client', 'true')
    .replaceAll('import.meta.server', 'false')
    .replaceAll('import.meta.dev', 'true')
    .replace('export default ', 'const middleware = ')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source, { mode: 'transform' }) + ';return ' + result,
    Object.keys(deps)
  )(...Object.values(deps))
}
function authHarness() {
  let next,
    fail,
    unsubscribed = 0,
    timers = 0
  const api = load(
    '../runtime/utils/routeAuthGuard.ts',
    '{resolveClientAuthState,createClientRouteCheck}',
    {
      watch,
      getApps: () => [{}],
      getApp: () => ({}),
      getAuth: () => ({ currentUser: null }),
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
    next: (user) => next(user),
    fail: () => fail(new Error('private-provider-detail')),
  }
}
const tick = async () => {
  await Promise.resolve()
  await Promise.resolve()
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
  const h = authHarness(),
    moves = [],
    errors = [],
    ready = []
  const path =
    kind === 'workspace'
      ? '/workspace/kitchen/menus'
      : kind === 'dev'
        ? '/diagnostics/users'
        : '/dashboard/connections'
  const route = {
    path,
    fullPath: path + '?from=arrival#detail',
    query: {},
    meta: { requiresAuth: true, roles: admin ? ['admin'] : [] },
  }
  const router = { currentRoute: ref({ fullPath: route.fullPath }) }
  let resolveAdmin
  const guard = load(
    `../runtime/middleware/fireux-${kind === 'dev' ? 'diagnostics-only' : kind}.global.ts`,
    'middleware',
    {
      ...h.api,
      defineNuxtRouteMiddleware: (f) => f,
      navigateTo: (target) => {
        moves.push(target)
        return target
      },
      useNuxtApp: () => ({
        isHydrating: hydrating,
        runWithContext: (f) => f(),
      }),
      useRouter: () => router,
      onNuxtReady: (f) => ready.push(f),
      showError: (error) => errors.push(error),
      useRuntimeConfig: () => ({
        public: {
          fireux: {
            id: 'app-A',
            developerId: 'user-A',
            workspaces: ['kitchen'],
          },
        },
      }),
      resolveClientAppAdmin: () =>
        new Promise((resolve) => {
          resolveAdmin = resolve
        }),
      workspaceFamilyFromRouteContext: () => 'kitchen',
      normalizeWorkspaceFamily: (v) => v,
      abortNavigation: (error) => {
        throw error
      },
      createError: (options) => options,
      resolvePostAuthDestination,
    }
  )
  return {
    ...h,
    route,
    router,
    moves,
    errors,
    ready,
    guard,
    admin: (result) => resolveAdmin(result),
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
