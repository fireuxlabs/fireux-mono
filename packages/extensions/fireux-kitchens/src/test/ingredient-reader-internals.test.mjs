import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
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
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  reactive,
  ref,
  toValue,
  unref,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, dependencies) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const { useFirestoreCollectionState } = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  '({ useFirestoreCollectionState })',
  { computed, toValue, resolveReadOutcome, resolveHttpDocumentOutcome }
)
const { useKitchenWorkspaceReadPage } = load(
  'kitchen/composables/workspace/useKitchenWorkspaceReadPage.ts',
  '({ useKitchenWorkspaceReadPage })',
  { computed, unref }
)
function workspaceFixture() {
  const scope = effectScope()
  const workspace = {
    id: ref('mine'),
    data: ref({ id: 'mine', name: 'Mine' }),
    outcome: ref('ready'),
    accountReady: ref(true),
    hasAccount: ref(true),
  }
  const access = { ids: ref(['mine']), error: ref(null) }
  const session = { error: ref(null) }
  const source = {
    ingredients: ref([{ id: 'carrot', name: 'Carrot' }]),
    pending: ref(false),
    error: ref(null),
    collectionPath: ref(''),
  }
  let requestedId
  const use = load(
    'kitchen/composables/workspace/ingredients/useKitchenWorkspaceIngredients.ts',
    'useKitchenWorkspaceIngredients',
    {
      computed,
      useKitchenWorkspace: () => workspace,
      useKitchenAccess: () => access,
      useAppSession: () => session,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
      IngredientStorage: { collection: 'ingredients' },
      useKitchenIngredients: (id) => {
        requestedId = id
        return source
      },
      useKitchenWorkspaceReadPage,
      useFirestoreCollectionState,
    }
  )
  const state = scope.run(use)
  return {
    workspace,
    access,
    session,
    source,
    state,
    scope,
    get requestedId() {
      return requestedId.value
    },
  }
}
test('Kitchen collection uses only the exact ready owner and suppresses retained child rows', () => {
  const f = workspaceFixture()
  assert.equal(f.requestedId, 'mine')
  assert.equal(f.state.ingredients.value[0].name, 'Carrot')
  for (const outcome of ['pending', 'error', 'empty', 'idle']) {
    f.workspace.outcome.value = outcome
    assert.equal(f.requestedId, '')
    assert.deepEqual(f.state.ingredients.value, [])
    assert.equal(f.state.canWrite.value, false)
    assert.equal(f.state.outcome.value, outcome)
  }
  f.workspace.outcome.value = 'ready'
  f.workspace.data.value = { id: 'elsewhere' }
  assert.equal(f.requestedId, '')
  assert.equal(f.state.outcome.value, 'pending')
  f.workspace.data.value = { id: 'mine' }
  assert.equal(f.requestedId, 'mine')
  f.scope.stop()
})
test('owner failures and child failures remain distinct from loading, empty and inactive', () => {
  const f = workspaceFixture()
  f.workspace.outcome.value = 'error'
  f.access.error.value = new Error('Access denied')
  assert.equal(f.state.loadError.value.message, 'Access denied')
  assert.equal(f.state.pending.value, false)
  f.workspace.outcome.value = 'ready'
  f.access.error.value = null
  f.source.pending.value = true
  assert.equal(f.state.outcome.value, 'pending')
  assert.equal(f.state.count.value, 0)
  f.source.error.value = new Error('Links unavailable')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  assert.deepEqual(f.state.ingredients.value, [])
  f.source.pending.value = false
  f.source.error.value = null
  f.source.ingredients.value = []
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.canWrite.value, true)
  f.source.error.value = new Error('Old child failure')
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'idle'
  assert.equal(f.state.outcome.value, 'idle')
  assert.equal(f.state.loadError.value, undefined)
  f.scope.stop()
})
function catalogueFixture(includeInactive = false) {
  const scope = effectScope(),
    account = ref({ uid: 'admin', getIdToken: async () => 'token' })
  const config = reactive({ appId: 'app-a', role: 'global', devMode: false })
  const session = {
    appUser: ref({ role: 'admin', created: { at: 1 } }),
    pending: ref(false),
    error: ref(null),
  }
  const raw = {
    data: ref({ items: [{ id: 'carrot', name: 'Carrot' }] }),
    pending: ref(false),
    error: ref(null),
    refresh: async () => {},
  }
  let key, handler, options
  const use = load(
    'ingredient/composables/useIngredientCollection.ts',
    'useIngredientCollection',
    {
      computed,
      ref,
      watch,
      useAuth: () => ({ currentUser: account }),
      useFireUXConfig: () => config,
      useAppSession: () => session,
      useFirestoreCollectionState,
      useAsyncData: (k, h, o) => {
        key = k
        handler = h
        options = o
        return raw
      },
    }
  )
  const state = scope.run(() => use({ includeInactive }))
  return {
    state,
    raw,
    session,
    config,
    account,
    scope,
    handler: (...args) => handler(...args),
    get key() {
      return toValue(key)
    },
    get options() {
      return options
    },
  }
}
test('shared public catalogue masks refresh rows so image batch cannot act on stale missing images', () => {
  const f = catalogueFixture()
  assert.equal(f.options.server, true)
  assert.equal(f.state.ingredients.value.length, 1)
  f.raw.pending.value = true
  assert.deepEqual(f.state.ingredients.value, [])
  assert.equal(f.state.outcome.value, 'pending')
  f.raw.error.value = new Error('Read failed')
  assert.deepEqual(f.state.ingredients.value, [])
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  f.scope.stop()
})
test('private catalogue closes the old logical read for account, App and membership lifetimes, including ABA', () => {
  const f = catalogueFixture(true)
  assert.equal(f.options.server, false)
  const initial = f.key
  f.config.appId = 'app-b'
  assert.notEqual(f.key, initial)
  f.config.appId = 'app-a'
  assert.notEqual(f.key, initial)
  const appKey = f.key
  f.session.appUser.value = { role: 'admin', created: { at: 2 } }
  assert.notEqual(f.key, appKey)
  f.session.pending.value = true
  assert.deepEqual(f.state.ingredients.value, [])
  assert.equal(f.state.outcome.value, 'pending')
  f.session.error.value = new Error('Membership read failed')
  assert.equal(f.state.outcome.value, 'error')
  f.session.error.value = null
  f.session.pending.value = false
  f.session.appUser.value = { role: 'user' }
  assert.deepEqual(f.state.ingredients.value, [])
  assert.equal(f.state.outcome.value, 'idle')
  f.account.value = null
  assert.equal(f.state.outcome.value, 'idle')
  f.scope.stop()
})
test('private catalogue token wait cannot execute under an obsolete App/member scope', async () => {
  const f = catalogueFixture(true)
  let resolveToken
  f.account.value.getIdToken = () =>
    new Promise((resolve) => {
      resolveToken = resolve
    })
  const reads = []
  const task =
    ((currentReadFetch = async (request) => {
      reads.push(request)
      return { items: [] }
    }),
    f.handler({}, { signal: new AbortController().signal }))
  const rejection = assert.rejects(task, /context changed/)
  f.session.appUser.value = { role: 'admin', created: { at: 2 } }
  resolveToken('old-token')
  await rejection
  assert.deepEqual(reads, [])
  f.scope.stop()
})
test('Ingredient detail hides retained identity on pending/error, with error taking precedence during retry', () => {
  const id = ref('carrot')
  const raw = {
    data: ref({ ingredient: { id: 'carrot', name: 'Carrot' } }),
    pending: ref(false),
    error: ref(null),
    refresh: async () => {},
    then: (fn) => Promise.resolve().then(fn),
  }
  const use = load(
    'ingredient/composables/useIngredientDetail.ts',
    'useIngredientDetail',
    {
      computed,
      unref,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      useAsyncData: () => raw,
    }
  )
  const state = use(id)
  assert.equal(state.ingredient.value.name, 'Carrot')
  raw.pending.value = true
  assert.equal(state.ingredient.value, null)
  raw.error.value = { statusCode: 503 }
  assert.equal(state.outcome.value, 'error')
  raw.pending.value = false
  assert.equal(state.ingredient.value, null)
  raw.error.value = null
  id.value = 'onion'
  assert.equal(state.ingredient.value, null)
  assert.equal(state.outcome.value, 'pending')
  raw.data.value = null
  raw.error.value = { statusCode: 404 }
  assert.equal(state.outcome.value, 'empty')
  id.value = ''
  assert.equal(state.outcome.value, 'idle')
})
test('Kitchen association projection does not hydrate from retained canonical rows while roots refresh', () => {
  const id = ref('mine')
  const binding = {
    data: ref([{ id: 'carrot', ingredient_id: 'carrot' }]),
    pending: ref(false),
    error: ref(null),
  }
  const roots = {
    data: ref({ items: [{ id: 'carrot', name: 'Old carrot' }] }),
    pending: ref(false),
    error: ref(null),
  }
  const use = load(
    'kitchen/composables/ingredients/useKitchenIngredients.ts',
    'useKitchenIngredients',
    {
      computed,
      unref,
      useFireUXConfig: () => ({ appId: 'app' }),
      resolveKitchenChildCollectionBasePath: () => 'kitchens',
      KitchenIngredientStorage: { collection: 'ingredients' },
      useFirestoreRead: () => ({ firestoreFetchCollection: () => binding }),
      useAsyncData: () => roots,
      useCollectionById: () => ({ byId: () => undefined }),
    }
  )
  const state = use(id)
  assert.equal(state.ingredients.value[0].name, 'Old carrot')
  roots.pending.value = true
  assert.equal(state.ingredients.value[0].name, '')
  assert.equal(state.ingredients.value[0].missing_root_ingredient, false)
  assert.equal(state.pending.value, true)
  roots.pending.value = false
  roots.data.value = { items: [] }
  assert.equal(state.ingredients.value[0].missing_root_ingredient, true)
  roots.error.value = new Error('Old catalogue error')
  id.value = ''
  assert.equal(state.error.value, null)
  assert.equal(state.pending.value, false)
})
async function render(path, state) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const warnings = []
  const app = createSSRApp({
    setup: () => state,
    render: compile(template, {
      onError: (e) => {
        throw e
      },
      onWarn: (e) => {
        throw e
      },
    }),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'KitchenPrepAndProductionIngredientsCollection',
    'NuxtLink',
    'IngredientDetailSummary',
    'IngredientDetail',
    'IngredientEdit',
    'KitchenPrepAndProductionIngredientsPreview',
    'UButton',
    'UModal',
    'FireDiagnosticsDebugPanel',
  ])
    app.component(name, { render: () => null })
  for (const name of ['UPage', 'UPageHeader', 'UPageBody'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('div', slots.default?.()),
    })
  for (const name of ['UAlert', 'FireStateCard'])
    app.component(name, {
      props: ['title', 'state'],
      setup: (props) => () => h('p', props.title || props.state),
    })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}
test('actual Ingredients index distinguishes unready owner from a ready empty library', async () => {
  for (const [outcome, expected] of [
    ['pending', 'Loading Kitchen'],
    ['error', 'Kitchen unavailable'],
    ['empty', 'Kitchen not found'],
    ['idle', 'Select a kitchen'],
  ]) {
    const html = await render(
      'kitchen/components/PrepAndProduction/Ingredients/Index.vue',
      { storageKitchenId: '', outcome }
    )
    assert.match(html, new RegExp(expected))
    assert.doesNotMatch(html, /Start your ingredient library/)
  }
})
test('actual Ingredient detail shows inactive owner before retained child failure', async () => {
  const html = await render(
    'kitchen/components/PrepAndProduction/Ingredients/Detail/Index.vue',
    {
      outcome: 'idle',
      loadError: new Error('Old'),
      pending: false,
      ingredient: null,
      ingredientId: 'carrot',
      canWrite: false,
      deleteOpen: false,
      deleting: false,
      deleteError: '',
      debug: {},
    }
  )
  assert.match(html, /Select a kitchen/)
  assert.doesNotMatch(html, /Ingredient unavailable|Ingredient not found/)
})
test('public Ingredient page reader follows reused route params and closes the previous editor', () => {
  const scope = effectScope(),
    route = reactive({ params: { id: 'carrot' } })
  let readerId
  const state = scope.run(() =>
    load('pages/ingredients/[id].vue', '({docId})', {
      computed,
      ref,
      watch,
      definePageMeta: () => {},
      useRoute: () => route,
      useIngredientInterface: () => ({ profile: () => null }),
      useUserSession: () => ({ isAdmin: ref(true) }),
      useIngredientDetail: (id) => {
        readerId = id
        return {
          ingredient: ref(null),
          pending: ref(false),
          error: ref(null),
        }
      },
      useIngredientSeo: () => {},
    })
  )
  assert.equal(toValue(readerId), 'carrot')
  route.params.id = 'onion'
  assert.equal(toValue(readerId), 'onion')
  route.params.id = ['garlic']
  assert.equal(state.docId.value, 'garlic')
  scope.stop()
})

test('public Ingredient page renders failure before loading and missing separately', async () => {
  for (const [outcome, expected] of [
    ['error'],
    ['pending', 'Loading ingredient'],
    ['empty', 'Ingredient Not Found'],
  ]) {
    const html = await render('pages/ingredients/[id].vue', {
      pageTitle: 'Ingredient',
      pageDescription: '',
      outcome,
      ingredient: null,
    })
    assert.match(html, new RegExp(expected))
    if (outcome !== 'pending') assert.doesNotMatch(html, /Loading ingredient/)
  }
})

test('explicit empty Kitchen parent disables link reads and retained-ID hydration', async () => {
  const parent = ref('')
  let readPath, handler
  const use = load(
    'kitchen/composables/ingredients/useKitchenIngredients.ts',
    'useKitchenIngredients',
    {
      computed,
      unref,
      useFireUXConfig: () => ({ appId: 'app' }),
      resolveKitchenChildCollectionBasePath: ({ kitchenCollectionPath }) =>
        kitchenCollectionPath === undefined
          ? 'kitchens'
          : kitchenCollectionPath,
      KitchenIngredientStorage: { collection: 'ingredients' },
      useFirestoreRead: () => ({
        firestoreFetchCollection: (path) => {
          readPath = path
          return {
            data: ref([{ id: 'carrot', ingredient_id: 'carrot' }]),
            pending: ref(false),
            error: ref(null),
          }
        },
      }),
      useAsyncData: (_key, read) => {
        handler = read
        return {
          data: ref({ items: [] }),
          pending: ref(false),
          error: ref(null),
        }
      },
      useCollectionById: () => ({ byId: () => undefined }),
    }
  )
  use(ref('mine'), { kitchenCollectionPath: parent })
  assert.equal(readPath.value, '')
  const requests = []
  assert.deepEqual(
    await ((currentReadFetch = async (url) => {
      requests.push(url)
      return { items: [] }
    }),
    handler({}, { signal: new AbortController().signal })),
    { items: [] }
  )
  assert.deepEqual(requests, [])
  parent.value = 'kitchens'
  assert.equal(readPath.value, 'kitchens/mine/ingredients')
})

test('passed Ingredient detail closes its editor when the record identity changes', () => {
  const props = reactive({ ingredient: { id: 'carrot' } }),
    scope = effectScope()
  const state = scope.run(() =>
    load('ingredient/components/Detail/Index.vue', '({showAdmin})', {
      computed,
      ref,
      watch,
      defineProps: () => props,
      useUserSession: () => ({ isAdmin: ref(true) }),
      useIngredientInterface: () => ({ profile: () => null }),
    })
  )
  state.showAdmin.value = true
  props.ingredient = { id: 'onion' }
  assert.equal(state.showAdmin.value, false)
  scope.stop()
})
