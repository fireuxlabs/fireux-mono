import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
const {
  computed,
  ref,
  reactive,
  watch,
  unref,
  onScopeDispose,
  effectScope,
  h,
} = Vue
const extensions = new URL('../../../', import.meta.url)
function load(path, deps, result) {
  const source = readFileSync(new URL(path, extensions), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const resolveReadOutcome = load(
  '../core/fireux-core/src/runtime/utils/read-outcome.ts',
  {},
  'resolveReadOutcome'
)
const useFirestoreCollectionState = (options) => ({
  outcome: computed(() =>
    resolveReadOutcome({
      enabled: unref(options.active),
      pending: unref(options.pending),
      failed: Boolean(unref(options.error)),
      present: unref(options.count) > 0,
    })
  ),
})
const runtime = (pkg) => `${pkg}/src/runtime/`
const states = ['pending', 'error', 'empty', 'ready', 'idle']
test('Portfolio Documents and Links use one reactive binding, preserve failures and mask stale records', () => {
  for (const [name, model] of [
    ['Documents', 'Document'],
    ['DocumentLinks', 'DocumentLink'],
  ]) {
    const scope = effectScope(),
      path = ref('portfolios/a/docs'),
      targetOutcome = ref('ready'),
      source = ref([{ id: 'one' }])
    source.pending = ref(false)
    source.error = ref(null)
    let calls = 0,
      boundPath
    const api = scope.run(() =>
      load(
        runtime('fireux-documents') +
          `portfolio/composables/documents/usePortfolio${name}.ts`,
        {
          computed,
          useFirestoreCollectionState,
          useFirestoreRead: () => ({
            firestoreFetchCollection: (p) => {
              calls++
              boundPath = p
              return source
            },
          }),
          usePortfolioWorkspaceChildPath: () => path,
          useCollectionById: () => ({ byId: () => undefined }),
          [model + 'Storage']: { collection: 'docs' },
          runtimePortfolio: { targetOutcome },
        },
        `usePortfolio${name}({targetOutcome})`.replace(
          '{targetOutcome}',
          'runtimePortfolio'
        )
      )
    )
    assert.equal(api.collection.value.length, 1)
    source.pending.value = true
    assert.equal(api.outcome.value, 'pending')
    assert.deepEqual(api.collection.value, [])
    source.error.value = Error('failed')
    assert.equal(api.outcome.value, 'error')
    assert.equal(api.error.value.message, 'failed')
    assert.deepEqual(api.collection.value, [])
    source.error.value = null
    source.pending.value = false
    source.value = []
    assert.equal(api.outcome.value, 'empty')
    targetOutcome.value = 'pending'
    assert.equal(api.outcome.value, 'pending')
    path.value = 'portfolios/b/docs'
    assert.equal(boundPath.value, path.value)
    assert.equal(calls, 1)

    scope.stop()
  }
})

test('Supplier Catalogue waits for both collections and distinguishes either failure from empty', () => {
  const scope = effectScope(),
    workspace = { id: ref('a'), data: ref({}), outcome: ref('ready') }
  const catalogues = ref([{ id: 'one' }]),
    items = ref([{ id: 'item' }]),
    catalogueOutcome = ref('ready'),
    itemOutcome = ref('ready'),
    catalogueError = ref(null),
    itemError = ref(null)
  let enabled
  const api = scope.run(() =>
    load(
      runtime('fireux-suppliers') +
        'supplier/composables/workspace/catalogue/useSupplierWorkspaceCatalogue.ts',
      {
        computed,
        resolveReadOutcome,
        resolveHttpDocumentOutcome,
        SupplierStorage: { collection: 'suppliers' },
        useSupplierWorkspace: () => workspace,
        useSupplierDetail: () => ({ place: ref({ name: 'A' }) }),
        useSupplierCatalogueCollection: (_, options) => {
          enabled = options.enabled
          return {
            supplierCatalogues: catalogues,
            pending: computed(() => catalogueOutcome.value === 'pending'),
            outcome: catalogueOutcome,
            error: catalogueError,
            collectionPath: ref('path'),
          }
        },
        useSupplierItemCollection: () => ({
          supplierItems: items,
          pending: computed(() => itemOutcome.value === 'pending'),
          outcome: itemOutcome,
          error: itemError,
        }),
      },
      'useSupplierWorkspaceCatalogue()'
    )
  )
  assert.equal(api.catalogues.value.length, 1)
  itemOutcome.value = 'pending'
  assert.equal(api.outcome.value, 'pending')
  assert.deepEqual(api.catalogues.value, [])
  itemOutcome.value = 'error'
  itemError.value = Error('items failed')
  assert.equal(api.outcome.value, 'error')
  assert.equal(api.readError.value.message, 'items failed')
  itemError.value = null
  itemOutcome.value = 'ready'
  catalogueOutcome.value = 'error'
  catalogueError.value = Error('catalogue failed')
  assert.equal(api.outcome.value, 'error')
  catalogueError.value = null
  catalogueOutcome.value = 'empty'
  catalogues.value = []
  assert.equal(api.outcome.value, 'empty')
  workspace.outcome.value = 'pending'
  assert.equal(enabled.value, false)
  assert.equal(api.outcome.value, 'pending')
  scope.stop()
})
test('Supplier Ingredients preserves association failures as well as hydration failures', () => {
  const scope = effectScope(),
    workspace = { id: ref('a'), data: ref({}), outcome: ref('ready') }
  const sourceOutcome = ref('ready'),
    sourceError = ref(null),
    rootsError = ref(null),
    rootsPending = ref(false)
  const api = scope.run(() =>
    load(
      runtime('fireux-suppliers') +
        'supplier/composables/workspace/ingredients/useSupplierWorkspaceIngredients.ts',
      {
        computed,
        resolveReadOutcome,
        resolveHttpDocumentOutcome,
        SupplierStorage: { collection: 'suppliers' },
        useSupplierWorkspace: () => workspace,
        useSupplierDetail: () => ({ place: ref({ name: 'A' }) }),
        useSupplierIngredientCollection: () => ({
          collectionPath: ref('path'),
          supplierIngredients: ref([{ id: 'one', ingredient_id: 'carrot' }]),
          pending: computed(() => sourceOutcome.value === 'pending'),
          outcome: sourceOutcome,
          error: sourceError,
        }),
        useSupplierIngredientRoots: () => ({
          pending: rootsPending,
          error: rootsError,
          rootById: ref(new Map()),
        }),
      },
      'useSupplierWorkspaceIngredients()'
    )
  )
  assert.equal(api.ingredientItems.value[0].missing_root_ingredient, true)
  rootsPending.value = true
  assert.equal(api.outcome.value, 'pending')
  assert.deepEqual(api.ingredientItems.value, [])
  rootsError.value = Error('roots failed')
  assert.equal(api.outcome.value, 'error')
  assert.deepEqual(api.ingredientItems.value, [])
  rootsError.value = null
  rootsPending.value = false
  sourceError.value = Error('associations failed')
  sourceOutcome.value = 'error'
  assert.equal(api.outcome.value, 'error')
  assert.equal(api.loadError.value.message, 'associations failed')
  assert.deepEqual(api.ingredientItems.value, [])
  workspace.outcome.value = 'empty'
  assert.equal(api.outcome.value, 'empty')
  scope.stop()
})
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const tick = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
function reservations() {
  const scope = effectScope(),
    tokens = []
  const user = (uid) => ({
    uid,
    getIdToken: () => {
      const d = deferred()
      tokens.push(d)
      return d.promise
    },
  })
  const currentUser = ref(user('one')),
    config = reactive({ appId: 'app-a' }),
    appUser = ref({ created: { at: 'membership-a' } })
  const property = {
    id: ref('a'),
    canRead: ref(true),
    canWrite: ref(true),
    targetOutcome: ref('ready'),
  }
  const source = {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: () => {},
  }
  let handler
  const capture = load(
    '../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    { watch, onScopeDispose },
    'useCommandScope'
  )
  const api = scope.run(() =>
    load(
      runtime('fireux-reservations') +
        'property/composables/reservations/usePropertyReservations.ts',
      {
        computed,
        ref,
        watch,
        resolveReadOutcome,
        resolveHttpDocumentOutcome,
        useCommandScope: capture,
        useAuth: () => ({ currentUser }),
        useFireUXConfig: () => config,
        useUserSession: () => ({ appUser }),
        useCollectionById: () => ({ byId: () => undefined }),
        reservationNights: () => 1,
        useAsyncData: (_, fn) => {
          handler = fn
          return source
        },
        property,
      },
      'usePropertyReservations(property)'
    )
  )
  const start = () => {
    source.pending.value = true
    source.error.value = null
    const requests = []
    const promise =
      ((currentReadFetch = (...args) => {
        const d = deferred()
        requests.push({ args, ...d })
        return d.promise
      }),
      handler({}, { signal: new AbortController().signal }))
    return { promise, requests }
  }
  return {
    scope,
    api,
    currentUser,
    user,
    config,
    appUser,
    property,
    source,
    tokens,
    start,
  }
}
const booking = () => ({
  id: 'one',
  property_id: 'a',
  arrival_date: '2026-10-07',
  departure_date: '2026-10-08',
  status: 'confirmed',
})
test('Reservation reader retains truthful outcomes and rejects obsolete or mismatched responses', async () => {
  const x = reservations(),
    run = x.start()
  x.tokens[0].resolve('token')
  await tick()
  run.requests[0].resolve({ items: [booking()], limit: 500, truncated: true })
  x.source.data.value = await run.promise
  x.source.pending.value = false
  assert.equal(x.api.outcome.value, 'ready')
  assert.equal(x.api.summary.value.total, 1)
  assert.equal(x.api.truncated.value, true)
  x.source.pending.value = true
  assert.equal(x.api.outcome.value, 'pending')
  assert.deepEqual(x.api.collection.value, [])
  x.source.error.value = Error('private diagnostics')
  assert.equal(x.api.outcome.value, 'error')
  assert.doesNotMatch(x.api.error.value, /private diagnostics/)
  x.source.error.value = null
  x.source.pending.value = false
  x.source.data.value = { items: [], limit: 500, truncated: false }
  assert.equal(x.api.outcome.value, 'empty')
  x.property.canRead.value = false
  x.property.targetOutcome.value = 'empty'
  assert.equal(x.api.outcome.value, 'empty')
  assert.deepEqual(x.api.collection.value, [])
  x.scope.stop()
})
test('Reservation credential waits cannot retarget another Property or survive scope change away and back', async () => {
  for (const change of [
    'property',
    'account',
    'app',
    'membership',
    'access',
    'dispose',
  ]) {
    const x = reservations(),
      run = x.start()
    if (change === 'property') {
      x.property.id.value = 'b'
      x.property.id.value = 'a'
    }
    if (change === 'account') {
      x.currentUser.value = x.user('two')
      x.currentUser.value = x.user('one')
    }
    if (change === 'app') {
      x.config.appId = 'app-b'
      x.config.appId = 'app-a'
    }
    if (change === 'membership') {
      const old = x.appUser.value
      x.appUser.value = null
      x.appUser.value = old
    }
    if (change === 'access') {
      x.property.canRead.value = false
      x.property.canRead.value = true
    }
    if (change === 'dispose') x.scope.stop()
    x.tokens[0].resolve('old')
    await run.promise
    assert.equal(run.requests.length, 0, change)
    assert.deepEqual(x.api.collection.value, [])
    x.scope.stop()
  }
  const x = reservations(),
    run = x.start()
  x.tokens[0].resolve('token')
  await tick()
  x.property.id.value = 'b'
  x.property.id.value = 'a'
  run.requests[0].resolve({ items: [booking()], limit: 500, truncated: false })
  await run.promise
  assert.equal(x.api.outcome.value, 'pending')
  assert.deepEqual(x.api.collection.value, [])
  x.scope.stop()
})
async function render(path, state) {
  const source = readFileSync(new URL(path, extensions), 'utf8'),
    template = source.slice(
      source.indexOf('<template>') + 10,
      source.lastIndexOf('</template>')
    )
  const app = Vue.createSSRApp({
    setup: () => state,
    render: Vue.compile(template),
  })
  const names = [
    ...new Set(
      [...template.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map((x) => x[1])
    ),
  ]
  for (const name of names)
    app.component(name, {
      props: ['title', 'description', 'message'],
      setup:
        (props, { slots }) =>
        () =>
          h('div', { 'data-ui': name }, [
            props.title,
            props.description,
            props.message,
            slots.header?.(),
            slots.default?.(),
            slots.actions?.(),
          ]),
    })
  return renderToString(app)
}
test('Supplier pages show loading/error/unavailable without counts, stale cards or empty claims', async () => {
  for (const [cap, noun] of [
    ['Catalogue', 'supplier catalogue'],
    ['Items', 'supplier items'],
    ['Ingredients', 'Ingredient details'],
  ]) {
    for (const outcome of ['pending', 'error', 'idle']) {
      const html = await render(
        runtime('fireux-suppliers') +
          `supplier/components/Workspace/${cap}/Read.vue`,
        {
          outcome,
          cards: [],
          debug: {},
          catalogueTitle: 'Catalogue',
          itemsTitle: 'Items',
          catalogueDescription: '',
          itemsDescription: '',
          catalogues: [],
          supplierItems: [],
          ingredientItems: [],
        }
      )
      assert.doesNotMatch(html, /No supplier|No catalogue|data-ui="UBadge"/)
      if (outcome === 'error') assert.match(html, /FireCopyError/)
      if (outcome === 'pending') assert.match(html, /Loading/)
      if (outcome === 'idle') assert.match(html, /Select an available Supplier/)
    }
  }
})
test('Portfolio pages and Property bookings hide summaries, tools and false-empty/free calendar on failed reads', async () => {
  const paths = [
    ['fireux-documents', 'portfolio/components/Workspace/Documents/Index.vue'],
    ['fireux-tasks', 'portfolio/components/Workspace/Tasks/Index.vue'],
    [
      'fireux-compliance',
      'portfolio/components/Workspace/Compliance/Index.vue',
    ],
    [
      'fireux-reservations',
      'property/components/Workspace/Reservations/Index.vue',
    ],
    ['fireux-reservations', 'property/components/Workspace/Calendar/Index.vue'],
  ]
  for (const [pkg, path] of paths)
    for (const outcome of ['pending', 'error', 'idle']) {
      const html = await render(runtime(pkg) + path, {
        outcome,
        error: 'Read failed',
        writeError: '',
        isDev: false,
      })
      assert.doesNotMatch(
        html,
        /No documents|No tasks|No compliance|No reservations|Booked nights|Confirmed|Create task|Upload document|Total records|Source:|shared availability/
      )
      if (outcome === 'error') assert.match(html, /FireCopyError/)
      if (outcome === 'pending') assert.match(html, /Loading/)
      if (outcome === 'idle') assert.match(html, /Select an available/)
    }
})
