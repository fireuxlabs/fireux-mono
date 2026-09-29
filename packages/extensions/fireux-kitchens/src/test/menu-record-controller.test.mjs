import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  toValue,
  unref,
  watch,
  effectScope,
  createSSRApp,
  h,
  inject,
  provide,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'

function load(path, names, dependencies) {
  const code = readFileSync(
    new URL(`../runtime/${path}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(code)}; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function fixture(realInjection = false) {
  const kitchenId = ref('kitchen-a'),
    slug = ref('food'),
    uid = ref('user-a')
  const config = { appId: 'misebox' }
  const session = {
    uid,
    pending: ref(false),
    error: ref(null),
    appUser: ref({ role: 'user', subscription: 'free', created: { at: 1 } }),
  }
  const access = {
    ids: ref(['kitchen-a', 'kitchen-b']),
    pending: ref(false),
    error: ref(null),
  }
  const kitchen = {
    kitchen: ref({ id: 'kitchen-a', name: 'Kitchen A', services: [] }),
    place: ref(null),
    error: ref(null),
    outcome: ref('ready'),
  }
  const rows = ref([{ id: 'menu-a', slug: 'food', name: 'Food' }])
  const queryError = ref(null),
    loading = ref(false),
    bound = ref('')
  const source = Object.assign(ref({ id: 'menu-a', file_name: 'food.pdf' }), {
    pending: ref(false),
    error: ref(null),
  })
  const reads = [],
    writes = [],
    provided = new Map()
  let queryKey, currentConstraints, currentPath
  const settle = () => {
    bound.value = queryKey.value
  }
  const queryIdentities = new WeakMap()
  let nextQueryIdentity = 0
  const firestoreFetchCollection = (path, constraints) => {
    currentPath = path
    currentConstraints = constraints
    // Core's live binding suppresses obsolete query values synchronously.
    queryKey = computed(() => {
      const query = constraints.value
      if (!queryIdentities.has(query))
        queryIdentities.set(query, ++nextQueryIdentity)
      return JSON.stringify([path.value, queryIdentities.get(query)])
    })
    settle()
    const pending = computed(
      () =>
        Boolean(path.value) && (bound.value !== queryKey.value || loading.value)
    )
    const error = computed(() =>
      path.value && bound.value === queryKey.value ? queryError.value : null
    )
    const data = computed(() =>
      path.value && !pending.value && !error.value ? rows.value : undefined
    )
    reads.push(['menu', path, constraints])
    return Object.assign(data, { pending, error })
  }
  const { useKitchenMenuRead } = load(
    'menu/composables/useKitchenMenuRead.ts',
    'useKitchenMenuRead',
    {
      computed,
      toValue,
      resolveReadOutcome,
      where: (field, operator, value) => ({ field, operator, value }),
      limit: (count) => ({ count }),
      resolveKitchenChildCollectionPath: ({
        kitchenCollectionPath = 'kitchens',
        kitchenId,
        collectionName,
      }) =>
        kitchenId && kitchenCollectionPath
          ? `${kitchenCollectionPath}/${kitchenId}/${collectionName}`
          : '',
      KitchenMenuStorage: { scopeCollection: 'menus' },
      useFirestoreRead: () => ({ firestoreFetchCollection }),
    }
  )
  const command =
    (name) =>
    async (...args) => {
      writes.push([name, ...args])
    }
  const deps = {
    computed,
    inject: realInjection
      ? inject
      : (key, fallback) => provided.get(key) ?? fallback,
    provide: realInjection ? provide : (key, value) => provided.set(key, value),
    useRouteParam: () => slug,
    useAppSession: () => session,
    useFireUXConfig: () => config,
    useWorkspace: () => ({ selectedId: kitchenId }),
    useKitchenAccess: () => {
      reads.push('access')
      return access
    },
    useKitchenRead: (id) => {
      reads.push(['kitchen', id])
      return kitchen
    },
    useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
    readRuntimeFirestoreDatabaseId: () => 'misebox',
    readKitchenCurrency: () => 'CHF',
    kitchenMenuOrdering: () => ({}),
    useKitchenMenuRead,
    useFirestoreRead: () => ({
      firestoreFetchDoc: (path, id) => {
        reads.push(['source', path, id])
        return source
      },
    }),
    MenuSourceUploadStorage: { collection: 'menu-uploads' },
    useMenuSectionCollection: (kitchen, menu) => {
      reads.push(['sections', kitchen, menu])
      return {
        sections: ref([]),
        pending: ref(false),
        error: ref(null),
        collectionPath: ref('sections'),
      }
    },
    useMenuSectionMutations: () =>
      Object.fromEntries(
        [
          'createSection',
          'updateSection',
          'archiveSection',
          'reorderSections',
        ].map((name) => [name, command(name)])
      ),
    useMenuUpdate: () => ({
      updateMenu: command('update'),
      renameMenu: command('rename'),
    }),
    useMenuPublication: () => ({
      publishMenu: command('publish'),
      unpublishMenu: command('unpublish'),
    }),
  }
  const api = load(
    'kitchen/composables/workspace/menus/useKitchenMenuRecordContext.ts',
    'provideKitchenMenuRecordContext,useKitchenMenuRecordContext,useOptionalKitchenMenuRecordContext',
    deps
  )
  return {
    ...api,
    kitchen,
    access,
    session,
    config,
    rows,
    queryError,
    loading,
    source,
    reads,
    writes,
    slug,
    kitchenId,
    settle,
    get path() {
      return currentPath.value
    },
    get constraints() {
      return currentConstraints.value
    },
  }
}

test('nested header and tools share one provided workflow and one bounded slug query', async () => {
  const f = fixture(true),
    seen = []
  const Child = {
    setup() {
      const state = f.useKitchenMenuRecordContext()
      seen.push(state)
      return () => h('span', state.menu.value?.name)
    },
  }
  const Nested = {
    setup() {
      seen.push(f.useKitchenMenuRecordContext())
      return () => h(Child)
    },
  }
  const Root = {
    setup() {
      seen.push(f.provideKitchenMenuRecordContext())
      return () => h('div', [h(Child), h(Nested)])
    },
  }
  await renderToString(createSSRApp(Root))
  assert.equal(new Set(seen).size, 1)
  assert.equal(
    f.reads.filter((x) => Array.isArray(x) && x[0] === 'menu').length,
    1
  )
  assert.equal(f.path, 'kitchens/kitchen-a/menus')
  assert.deepEqual(f.constraints, [
    { field: 'slug', operator: '==', value: 'food' },
    { count: 2 },
  ])
})

test('record updates, slug changes, deletion/reappearance and duplicate slugs remain live', () => {
  const f = fixture(),
    state = f.provideKitchenMenuRecordContext()
  assert.equal(f.useKitchenMenuRecordContext(), state)
  f.rows.value[0].name = 'Dinner'
  assert.equal(state.menu.value.name, 'Dinner')
  f.slug.value = 'drinks'
  assert.equal(state.pending.value, true)
  assert.equal(state.menu.value, null)
  f.rows.value = [
    { id: 'menu-b', slug: 'drinks', name: 'Drinks', status: 'archived' },
  ]
  f.settle()
  assert.equal(state.menuId.value, 'menu-b')
  assert.equal(state.source.value, null)
  f.rows.value = []
  assert.equal(state.outcome.value, 'missing')
  f.rows.value = [{ id: 'menu-b', slug: 'drinks' }]
  assert.equal(state.outcome.value, 'ready')
  f.rows.value.push({ id: 'duplicate', slug: 'drinks' })
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.menu.value, null)
})

test('membership access, read-only App roles, denied reads and other errors stay distinct', async () => {
  const f = fixture(),
    state = f.provideKitchenMenuRecordContext()
  f.session.appUser.value.role = 'viewer'
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.canWrite.value, false)
  await assert.rejects(
    state.renameMenu('kitchen-a', 'menu-a', 'Dinner'),
    /read-only/
  )
  f.session.appUser.value.role = 'user'
  await state.renameMenu('kitchen-a', 'menu-a', 'Dinner')
  assert.equal(f.writes.length, 1)
  f.access.pending.value = true
  assert.equal(state.outcome.value, 'pending')
  assert.equal(state.menu.value, null)
  f.access.pending.value = false
  f.access.ids.value = []
  assert.equal(state.outcome.value, 'denied')
  assert.equal(state.storageKitchenId.value, '')
  f.access.ids.value = ['kitchen-a']
  f.settle()
  f.queryError.value = Object.assign(new Error('Denied'), {
    code: 'permission-denied',
  })
  assert.equal(state.outcome.value, 'denied')
  assert.equal(state.menu.value, null)
  f.queryError.value = new Error('Network unavailable')
  assert.equal(state.outcome.value, 'error')
  f.queryError.value = null
  assert.equal(state.outcome.value, 'ready')
  f.session.uid.value = ''
  assert.equal(state.outcome.value, 'denied')
})

test('account membership and Kitchen changes clear the record before new reads settle', () => {
  const f = fixture(),
    state = f.provideKitchenMenuRecordContext()
  f.session.uid.value = 'user-b'
  assert.equal(state.pending.value, true)
  assert.equal(state.menu.value, null)
  assert.equal(state.source.value, null)
  f.settle()
  assert.equal(state.outcome.value, 'ready')
  f.session.appUser.value.created.at = 2
  assert.equal(state.pending.value, true)
  f.settle()
  f.kitchenId.value = 'kitchen-b'
  f.kitchen.kitchen.value = { id: 'kitchen-b' }
  assert.equal(state.menu.value, null)
  assert.equal(f.path, 'kitchens/kitchen-b/menus')
  f.rows.value = [{ id: 'menu-c', slug: 'food' }]
  f.settle()
  assert.equal(state.menuId.value, 'menu-c')
  const source = f.reads.find((x) => Array.isArray(x) && x[0] === 'source')
  assert.equal(source[1].value, 'kitchens/kitchen-b/menu-uploads')
  assert.equal(source[2].value, 'menu-c')
  f.kitchen.outcome.value = 'missing'
  assert.equal(state.outcome.value, 'missing')
  assert.equal(state.menu.value, null)
  f.kitchenId.value = ''
  assert.equal(state.outcome.value, 'idle')
})

test('source-only failure does not hide a loaded Menu, and upload-only entry needs no record provider', () => {
  const f = fixture(),
    state = f.provideKitchenMenuRecordContext()
  f.source.error.value = new Error('Source failed')
  assert.equal(state.menuId.value, 'menu-a')
  assert.equal(state.source.value, null)
  f.source.error.value = null
  assert.equal(state.source.value.file_name, 'food.pdf')
  for (const useRecord of [true, false]) {
    let collectionCalls = 0
    const owner = effectScope()
    owner.run(() => {
      const upload = load(
        'kitchen/composables/workspace/menus/useKitchenWorkspaceMenuUploadPayload.ts',
        'useKitchenWorkspaceMenuUploadPayload',
        {
          computed,
          ref,
          unref,
          watch,
          useAuth: () => ({ currentUser: ref(null) }),
          normalizeSlug: (value) => value,
          useOptionalKitchenMenuRecordContext: () => (useRecord ? state : null),
          useKitchenMenusContextSource: () => {
            collectionCalls++
            return { ...state, menu: ref(null) }
          },
        }
      ).useKitchenWorkspaceMenuUploadPayload({ uploadId: 'source-only' })
      assert.equal(upload.payload.value.slug.initialValue, 'source-only')
      assert.equal(upload.payload.value.consumer.kitchen.id, 'kitchen-a')
      assert.equal(collectionCalls, useRecord ? 0 : 1)
    })
    owner.stop()
  }
  const independent = fixture()
  assert.equal(independent.useOptionalKitchenMenuRecordContext(), null)
  assert.throws(
    () => independent.useKitchenMenuRecordContext(),
    /not available/
  )
})
