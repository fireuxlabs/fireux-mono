import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed, effectScope, reactive, ref, toValue, watch } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

function load(file, name, dependencies = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function propertyIndexHarness(
  destination = '/workspace/property/reservations'
) {
  const navigation = deferred()
  const navigations = [],
    navigationRequests = [],
    selections = []
  const state = new Map()
  const session = {
    uid: ref('u'),
    appUser: ref({ created: { at: { seconds: 1 } } }),
  }
  const config = reactive({ appId: 'app' })
  const workspace = {
    selectedId: ref('a'),
    reconcile() {},
    select(id) {
      selections.push(id)
      this.selectedId.value = id
    },
  }
  const access = { ids: ref(['a', 'b', 'c']), outcome: ref('ready') }
  const collection = {
    properties: ref([{ id: 'a' }, { id: 'b' }, { id: 'c' }]),
    outcome: ref('ready'),
  }
  const scope = effectScope()
  const createIndex = () =>
    scope.run(() =>
      load(
        '../runtime/property/composables/workspace/usePropertyWorkspaceIndex.ts',
        'usePropertyWorkspaceIndex',
        {
          computed,
          watch,
          useCommandScope,
          useState: (key, init) => {
            if (!state.has(key)) state.set(key, ref(init()))
            return state.get(key)
          },
          useWorkspace: () => workspace,
          useAppSession: () => session,
          useFireUXConfig: () => config,
          usePropertyAccess: () => access,
          usePropertyCollection: () => collection,
          useRoute: () => ({
            matched: [{ path: '/workspace/property/reservations/:id' }],
          }),
          useRouter: () => ({
            getRoutes: () => [{ path: '/workspace/property/reservations' }],
          }),
          propertyWorkspaceSwitchPath: () => destination,
          navigateTo: (path, options) => {
            navigations.push({ path, options })
            const request = navigationRequests.length ? deferred() : navigation
            navigationRequests.push(request)
            return request.promise
          },
        }
      )()
    )
  const index = createIndex()
  return {
    index,
    createIndex,
    scope,
    session,
    config,
    workspace,
    access,
    collection,
    navigation,
    navigationRequests,
    navigations,
    selections,
  }
}

for (const [label, change] of [
  [
    'account',
    (h) => {
      h.session.uid.value = 'other'
      h.session.uid.value = 'u'
    },
  ],
  [
    'membership',
    (h) => {
      const original = h.session.appUser.value
      h.session.appUser.value = null
      h.session.appUser.value = original
    },
  ],
  [
    'App',
    (h) => {
      h.config.appId = 'other'
      h.config.appId = 'app'
    },
  ],
  [
    'selection',
    (h) => {
      h.workspace.selectedId.value = 'c'
      h.workspace.selectedId.value = 'a'
    },
  ],
  [
    'access grant',
    (h) => {
      h.access.ids.value = ['a']
      h.access.ids.value = ['a', 'b', 'c']
    },
  ],
  [
    'read availability',
    (h) => {
      h.collection.outcome.value = 'error'
      h.collection.outcome.value = 'ready'
    },
  ],
  ['disposal', (h) => h.scope.stop()],
]) {
  test(`Property switch preserves current selection after ${label} change-away-and-back while navigating`, async () => {
    const h = propertyIndexHarness()
    const selecting = h.index.select('b')
    assert.deepEqual(h.navigations, [
      { path: '/workspace/property/reservations', options: { replace: true } },
    ])
    change(h)
    h.navigation.resolve()
    await selecting
    assert.deepEqual(h.selections, [])
    assert.equal(h.workspace.selectedId.value, 'a')
    h.scope.stop()
  })
}

test('Property switch selects a current available record after its required navigation', async () => {
  const h = propertyIndexHarness()
  const selecting = h.index.select('b')
  assert.equal(h.workspace.selectedId.value, 'a')
  h.navigation.resolve()
  await selecting
  assert.deepEqual(h.selections, ['b'])
  h.scope.stop()
})

test('Property switch skips unavailable choices, handles synchronous selection and rechecks the returned collection', async () => {
  const direct = propertyIndexHarness(null)
  await direct.index.select('a')
  await direct.index.select('forged')
  assert.deepEqual(direct.selections, [])
  assert.deepEqual(direct.navigations, [])
  direct.access.outcome.value = 'pending'
  await direct.index.select('b')
  assert.deepEqual(direct.selections, [])
  direct.access.outcome.value = 'ready'
  await direct.index.select('b')
  assert.deepEqual(direct.selections, ['b'])
  direct.scope.stop()

  const delayed = propertyIndexHarness()
  const selecting = delayed.index.select('b')
  delayed.collection.properties.value = [{ id: 'a' }]
  delayed.navigation.resolve()
  await selecting
  assert.deepEqual(delayed.selections, [])
  delayed.scope.stop()
})

test('Property switches from independent index instances honor the latest choice despite navigation order', async () => {
  const h = propertyIndexHarness()
  const sidebar = h.createIndex()
  const first = h.index.select('b')
  const latest = sidebar.select('c')
  h.navigationRequests[0].resolve()
  await first
  assert.deepEqual(h.selections, [])
  h.navigationRequests[1].resolve()
  await latest
  assert.deepEqual(h.selections, ['c'])
  assert.equal(h.workspace.selectedId.value, 'c')
  h.scope.stop()
})

test('Reselecting the current Property through another index cancels a pending different choice', async () => {
  const h = propertyIndexHarness()
  const sidebar = h.createIndex()
  const first = h.index.select('b')
  await sidebar.select('a')
  assert.equal(h.navigations.length, 1)
  h.navigation.resolve()
  await first
  assert.deepEqual(h.selections, [])
  assert.equal(h.workspace.selectedId.value, 'a')
  h.scope.stop()
})

const readMembershipAccessIds = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
for (const entity of ['portfolio', 'property']) {
  test(`${entity} Access reports a failed branch while the independent App/access branch is pending`, () => {
    const membership = {
      role: 'user',
      subscription: 'free',
      created: { at: { seconds: 1, nanoseconds: 0 } },
    }
    const app = {
      uid: ref('u'),
      appUser: ref(membership),
      pending: ref(false),
      error: ref(),
    }
    const binding = Object.assign(
      ref({ ids: ['a'], membership_created_at: membership.created.at }),
      {
        pending: ref(false),
        error: ref(),
        outcome: ref('ready'),
      }
    )
    let bindings = 0
    const useMembershipAccess = load(
      '../../../../core/fireux-core/src/runtime/app/composables/membership/useMembershipAccess.ts',
      'useMembershipAccess',
      {
        computed,
        toValue,
        readMembershipAccessIds,
        useFirestoreRead: () => ({
          firestoreFetchDoc: () => {
            bindings++
            return binding
          },
        }),
      }
    )
    const name = entity === 'portfolio' ? 'Portfolio' : 'Property'
    const access = load(
      `../runtime/${entity}/composables/use${name}Access.ts`,
      `use${name}Access`,
      {
        computed,
        useMembershipAccess,
        useAppSession: () => app,
        useFireUXConfig: () => ({ appId: 'app' }),
        [`${entity}AccessCollection`]: () => `${entity}_access/app/users`,
      }
    )()
    assert.equal(access.outcome.value, 'ready')
    assert.deepEqual(access.ids.value, ['a'])
    app.error.value = Error('App membership unavailable')
    binding.pending.value = true
    assert.equal(access.outcome.value, 'error')
    assert.deepEqual(access.ids.value, [])
    app.error.value = undefined
    binding.pending.value = false
    binding.error.value = Error('Access unavailable')
    app.pending.value = true
    assert.equal(access.outcome.value, 'error')
    assert.deepEqual(access.ids.value, [])
    binding.error.value = undefined
    assert.equal(access.outcome.value, 'pending')
    app.pending.value = false
    assert.equal(access.outcome.value, 'ready')
    assert.deepEqual(access.ids.value, ['a'])
    assert.equal(bindings, 1)
  })
}

test('Portfolio detail hides Nuxt retained data during refresh, route changes, idle and failures', async () => {
  const id = ref('a')
  const state = {
    data: ref({ portfolio: { id: 'a', identity: { name: 'Alpha' } } }),
    pending: ref(false),
    error: ref(),
    then: (fn) => Promise.resolve().then(fn),
  }
  let calls = 0,
    key,
    handler,
    options
  const detail = load(
    '../runtime/portfolio/composables/usePortfolioDetail.ts',
    'usePortfolioDetail',
    {
      computed,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      useLiveAsyncData: (nextKey, nextHandler, nextOptions) => {
        calls++
        key = nextKey
        handler = nextHandler
        options = nextOptions
        return state
      },
    }
  )(id)
  await detail.ready
  assert.equal(detail.outcome.value, 'ready')
  assert.equal(detail.portfolio.value.id, 'a')
  state.pending.value = true
  assert.equal(detail.portfolio.value, null)
  assert.equal(detail.outcome.value, 'pending')
  id.value = 'b'
  assert.equal(detail.portfolio.value, null)
  assert.equal(key(), 'portfolio-detail:b')
  state.pending.value = false
  // Nuxt 4.5.2 can seed a new reactive key with the preceding key's data.
  assert.equal(detail.outcome.value, 'pending')
  assert.equal(detail.portfolio.value, null)
  const requests = []
  await handler(async (request) => {
    requests.push(request)
    return { portfolio: { id: 'b' } }
  })
  assert.deepEqual(requests, ['/api/portfolios/b'])
  state.data.value = { portfolio: { id: 'b' } }
  assert.equal(detail.outcome.value, 'ready')
  assert.equal(detail.portfolio.value.id, 'b')
  state.error.value = Object.assign(Error('unpublished'), { statusCode: 404 })
  state.pending.value = true
  assert.equal(detail.outcome.value, 'empty')
  assert.equal(detail.pending.value, false)
  assert.equal(detail.portfolio.value, null)
  state.error.value = Error('denied')
  assert.equal(detail.outcome.value, 'error')
  assert.equal(detail.portfolio.value, null)
  id.value = ''
  assert.equal(detail.outcome.value, 'idle')
  assert.equal(detail.portfolio.value, null)
  assert.equal(
    await handler(() => {
      throw Error('inactive detail dispatched')
    }),
    null
  )
  id.value = 'b'
  state.pending.value = false
  state.error.value = undefined
  state.data.value = null
  assert.equal(detail.outcome.value, 'empty')
  assert.equal(detail.portfolio.value, null)
  state.data.value = { portfolio: { id: 'b' } }
  assert.equal(detail.outcome.value, 'ready')
  assert.equal(calls, 1)
  assert.equal(options.watch[0].value, 'b')
})
