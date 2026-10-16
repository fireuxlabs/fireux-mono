import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  nextTick,
  ref,
  unref,
  watchEffect,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \* from[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const paths = load(
  'kitchen/utils/kitchen-collection-path.ts',
  '({ normalizeString, resolveKitchenCollectionBasePath, resolveKitchenChildCollectionPath })',
  {}
)
const { MenuStorage } = load(
  'menu/models/menu-storage.model.ts',
  '({ MenuStorage })',
  {}
)
const { useFirestoreCollectionState } = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  '({ useFirestoreCollectionState })',
  { computed, resolveReadOutcome, toValue: unref }
)
async function render(path, state) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const warnings = []
  const app = createSSRApp({
    setup: () => ({ ...state, editor: state }),
    render: compile(template, {
      onError: (e) => {
        throw e
      },
      onWarn: (w) => {
        throw w
      },
    }),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'WorkspaceKitchenMenusItemsEditRow',
    'WorkspaceKitchenMenusSectionsCreate',
    'WorkspaceKitchenMenusSectionsCollectionRow',
    'WorkspaceKitchenMenusUploadsDetailSummary',
    'WorkspaceKitchenMenusUploadsDetailFile',
    'UInput',
    'UBreadcrumb',
    'DiagnosticsDebugPanel',
    'UFormField',
    'WorkspaceKitchenMenusSectionsDishes',
    'WorkspaceKitchenMenusSectionsCollectionSchedule',
    'UButton',
    'NuxtLink',
    'USwitch',
    'WorkspaceKitchenMenusItemsSharedTerms',
    'WorkspaceKitchenMenusItemsAdoptSharedTerms',
    'MoleculesFormsEditableSimpleField',
    'MoleculesDisclosurePanel',
    'WorkspaceKitchenMenusItemsOptions',
    'WorkspaceKitchenMenusCollection',
    'WorkspaceKitchenMenusAi',
  ])
    app.component(name, { render: () => null })
  app.component('UCard', {
    setup:
      (_, { slots }) =>
      () =>
        h('div', [slots.header?.(), slots.default?.()]),
  })
  app.component('UBadge', {
    setup:
      (_, { slots }) =>
      () =>
        h('span', { 'data-count': true }, slots.default?.()),
  })
  app.component('UAlert', {
    props: ['title'],
    setup: (props) => () => h('p', props.title),
  })
  app.component('MoleculesCopyError', {
    props: ['message'],
    setup: (props) => () => h('p', props.message),
  })
  app.component('MoleculesStateCard', {
    props: ['title'],
    setup: (props) => () => h('p', props.title),
  })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}
const sectionsPath = 'kitchen/components/Workspace/Menus/Sections/Collection/Index.vue'
function sectionView(overrides = {}) {
  return {
    menu: { description: 'Current menu' },
    selectedDate: '2026-10-09',
    daily: false,
    formattedDate: 'Today',
    showCreateSection: false,
    canWrite: false,
    visibleSections: [],
    sectionsPending: false,
    sectionsError: null,
    ...overrides,
  }
}
for (const state of ['pending', 'error'])
  test(`Menu sections ${state} is distinct from a settled empty catalogue`, async () => {
    const html = await render(
      sectionsPath,
      sectionView({
        sectionsPending: state === 'pending',
        sectionsError: state === 'error' ? new Error('Sections failed') : null,
      })
    )
    assert.ok(!html.includes('No sections yet.'), html)
    assert.ok(
      state === 'error'
        ? html.includes('Sections failed')
        : /loading/i.test(html),
      html
    )
    assert.ok(html.includes('Current menu'), html)
  })
test('Menu sections show empty copy only after the child read settles', async () => {
  assert.ok(
    (await render(sectionsPath, sectionView())).includes('No sections yet.')
  )
})
const itemsPath = 'kitchen/components/Workspace/Menus/Items/Edit/Index.vue'
function itemView(overrides = {}) {
  return {
    menuSlug: 'food',
    section: { id: 's', label: 'Starters' },
    sectionId: 's',
    itemRows: [],
    pending: false,
    sectionsPending: false,
    sectionsError: null,
    itemsPending: false,
    itemsError: null,
    canWrite: true,
    ...overrides,
  }
}
for (const state of ['pending', 'error'])
  test(`Menu items ${state} hides empty copy and premature counts`, async () => {
    const html = await render(
      itemsPath,
      itemView({
        itemsPending: state === 'pending',
        itemsError: state === 'error' ? new Error('Items failed') : null,
      })
    )
    assert.ok(!html.includes('No entries have been added'), html)
    assert.ok(!html.includes('data-count'), html)
    assert.ok(
      state === 'error' ? html.includes('Items failed') : /loading/i.test(html),
      html
    )
    assert.ok(html.includes('Starters'), html)
  })
for (const state of ['pending', 'error'])
  test(`Menu section lookup ${state} is not a missing record`, async () => {
    const html = await render(
      itemsPath,
      itemView({
        section: null,
        sectionsPending: state === 'pending',
        sectionsError: state === 'error' ? new Error('Sections failed') : null,
      })
    )
    assert.ok(!html.includes('Section not found'), html)
    assert.ok(
      state === 'error'
        ? html.includes('Sections failed')
        : /loading/i.test(html),
      html
    )
  })
test('Menu items expose a real zero only for a settled empty section', async () => {
  const html = await render(itemsPath, itemView())
  assert.ok(html.includes('No entries have been added'), html)
  assert.ok(html.includes('data-count="true"'), html)
  assert.ok(html.includes('>0</span>'), html)
})
function collectionFixture() {
  const owner = effectScope()
  const workspace = {
    id: ref('old-kitchen'),
    outcome: ref('ready'),
    data: ref({ id: 'old-kitchen' }),
  }
  const session = {
    uid: ref('account-a'),
    appUser: ref({ role: 'user' }),
    error: ref(null),
  }
  const menusPending = ref(false),
    menusError = ref(null),
    sourcesPending = ref(false),
    sourcesError = ref(null)
  const menuRows = ref([
      {
        id: 'private-menu',
        slug: 'private',
        name: 'Private',
        status: 'draft',
        sort_order: 1,
      },
    ]),
    sourceRows = ref([{ id: 'private-source' }])
  let menuPath, sourcePath, createOptions
  function firestoreFetchCollection(path) {
    const isMenu = path.value.endsWith('/menus')
    if (isMenu) menuPath = path
    else sourcePath = path
    const pending = isMenu ? menusPending : sourcesPending,
      error = isMenu ? menusError : sourcesError,
      rows = isMenu ? menuRows : sourceRows
    const active = computed(() => Boolean(path.value))
    const outcome = computed(() =>
      resolveReadOutcome({
        active: active.value,
        kind: 'collection',
        pending: pending.value,
        error: error.value,
        present: rows.value.length > 0,
      })
    )
    const data = computed(() =>
      ['ready', 'empty'].includes(outcome.value) ? rows.value : undefined
    )
    return Object.assign(data, {
      outcome,
      pending: computed(() => outcome.value === 'pending'),
      error: computed(() => (active.value ? error.value : undefined)),
    })
  }
  const useFireUXConfig = () => ({ appId: 'app' })
  const useFirestoreRead = () => ({ firestoreFetchCollection })
  const useKitchenMenuCollection = load(
    'menu/composables/useKitchenMenuCollection.ts',
    'useKitchenMenuCollection',
    {
      computed,
      unref,
      MenuStorage: MenuStorage,
      useFireUXConfig,
      useFirestoreRead,
      ...paths,
    }
  )
  const useKitchenChildCollection = load(
    'kitchen/composables/useKitchenChildCollection.ts',
    'useKitchenChildCollection',
    {
      computed,
      unref,
      useFirestoreCollectionState,
      useFireUXConfig,
      useFirestoreRead,
      ...paths,
    }
  )
  const deps = {
    computed,
    watchEffect,
    useCookie: (_key, opt) => ref(opt.default()),
    useState: (_key, init) => ref(init()),
    useKitchenWorkspace: () => workspace,
    useKitchenWorkspaceIndex: () => ({
      collection: ref([]),
      outcome: ref('ready'),
      select() {},
    }),
    useKitchenWorkspaceIdentity: () => ({
      selectedKitchen: workspace.data,
      canWrite: computed(() => workspace.outcome.value === 'ready'),
    }),
    useFireUXConfig,
    useAppSession: () => session,
    readRuntimeFirestoreDatabaseId: () => 'db',
    useKitchenMenuCollection,
    useKitchenChildCollection,
    MenuSourceUploadStorage: { collection: 'menu-uploads' },
    useMenuCreate: (options) => {
      createOptions = options
      return { createMenu() {} }
    },
    useMenuUpdate: () => ({ updateMenu() {}, renameMenu() {} }),
    useMenuPublication: () => ({
      publishMenu() {},
      archiveMenu() {},
      unpublishMenu() {},
    }),
    readPlaceCurrencyCode: () => 'CHF',
    appSubscriptionCapacity: () => 4,
    hasAppSubscriptionCapacity: () => true,
    kitchenMenuCapacity: {},
    kitchenMenuOrdering: () => ({}),
    useKitchenOfferingCollection: () => ({
      offerings: ref([]),
      outcome: ref('empty'),
      error: ref(null),
    }),
  }
  const create = load(
    'kitchen/composables/workspace/menus/useKitchenWorkspaceMenus.ts',
    'useKitchenWorkspaceMenus',
    deps
  )
  return {
    owner,
    workspace,
    session,
    menusPending,
    menusError,
    sourcesPending,
    sourcesError,
    menuRows,
    api: owner.run(create),
    get menuPath() {
      return menuPath.value
    },
    get sourcePath() {
      return sourcePath.value
    },
    get createOptions() {
      return createOptions
    },
  }
}
for (const outcome of ['pending', 'error', 'missing', 'empty', 'idle'])
  test(`Menu and upload storage stop when the owning Kitchen is ${outcome}`, () => {
    const f = collectionFixture()
    assert.equal(f.api.menus.value.length, 1)
    f.workspace.outcome.value = outcome
    f.workspace.data.value = null
    assert.equal(f.menuPath, '')
    assert.equal(f.sourcePath, '')
    assert.deepEqual(f.api.menus.value, [])
    assert.deepEqual(f.api.menuSources.value, [])
    assert.equal(f.api.outcome.value, outcome)
    assert.equal(f.api.menuSourcesOutcome.value, outcome)
    assert.equal(f.api.canCreateMenu.value, false)
    f.owner.stop()
  })
test('an old Kitchen surface cannot activate Menu storage for the new selection', () => {
  const f = collectionFixture()
  f.workspace.id.value = 'new-kitchen'
  assert.equal(f.menuPath, '')
  assert.equal(f.api.outcome.value, 'pending')
  assert.deepEqual(f.api.menus.value, [])
  f.workspace.data.value = { id: 'new-kitchen' }
  assert.equal(f.menuPath, 'kitchens/new-kitchen/menus')
  assert.equal(f.api.outcome.value, 'ready')
  f.owner.stop()
})
test('account and membership recovery rebind the retained selection only after owner readiness', async () => {
  const f = collectionFixture()
  f.session.uid.value = 'account-b'
  f.session.appUser.value = null
  f.workspace.outcome.value = 'pending'
  f.workspace.data.value = null
  assert.equal(f.menuPath, '')
  assert.equal(f.api.selectedMenuId.value, '')
  f.session.appUser.value = { role: 'user' }
  f.workspace.outcome.value = 'ready'
  f.workspace.data.value = { id: 'old-kitchen' }
  await nextTick()
  assert.equal(f.menuPath, 'kitchens/old-kitchen/menus')
  assert.equal(f.api.selectedMenuId.value, 'private-menu')
  f.owner.stop()
})
test('a failed Menu read is not creation allowance and recovers through the same live reader', () => {
  const f = collectionFixture()
  f.menusError.value = new Error('Menus failed')
  assert.equal(f.api.outcome.value, 'error')
  assert.equal(f.api.error.value.message, 'Menus failed')
  assert.equal(f.api.canCreateMenu.value, false)
  assert.deepEqual(f.api.menus.value, [])
  f.menusError.value = null
  f.menusPending.value = true
  assert.equal(f.api.outcome.value, 'pending')
  assert.equal(f.api.canCreateMenu.value, false)
  f.menusPending.value = false
  f.menuRows.value = []
  assert.equal(f.api.outcome.value, 'empty')
  assert.equal(f.api.canCreateMenu.value, true)
  f.owner.stop()
})
test('an independent source-upload failure does not hide a loaded Menu', () => {
  const f = collectionFixture()
  f.sourcesError.value = new Error('Sources failed')
  assert.equal(f.api.outcome.value, 'ready')
  assert.equal(f.api.menus.value.length, 1)
  assert.deepEqual(f.api.menuSources.value, [])
  assert.equal(f.api.menuSourcesError.value.message, 'Sources failed')
  assert.equal(f.api.menuSourcesOutcome.value, 'error')
  assert.deepEqual(Object.keys(f.createOptions), ['kitchenId'])
  f.owner.stop()
})
for (const outcome of ['pending', 'error', 'missing'])
  test(`Menus entry shows the owning Kitchen ${outcome} before collection tools`, async () => {
    const html = await render('kitchen/components/Workspace/Menus/Index.vue', {
      storageKitchenId: '',
      outcome,
      error: outcome === 'error' ? new Error('Kitchen failed') : null,
      workspaceEntryPath: '/workspace/kitchen',
    })
    assert.ok(
      outcome === 'pending'
        ? /loading/i.test(html)
        : html.includes(
            outcome === 'error' ? 'Kitchen unavailable' : 'Kitchen not found'
          ),
      html
    )
    assert.ok(!html.includes('Choose a kitchen</p>'), html)
  })

for (const state of ['pending', 'error', 'empty'])
  test(`uploaded Menu source ${state} has truthful detail feedback`, async () => {
    const html = await render(
      'kitchen/components/Workspace/Menus/Uploads/Detail/Index.vue',
      {
        source: null,
        breadcrumbItems: [],
        debug: {},
        menuSourcesPending: state === 'pending' || state === 'error',
        menuSourcesError:
          state === 'error' ? new Error('Sources failed') : null,
      }
    )
    if (state === 'empty')
      assert.ok(html.includes('Menu source not found'), html)
    else {
      assert.ok(!html.includes('Menu source not found'), html)
      assert.ok(
        state === 'pending'
          ? html.includes('Loading menu source')
          : html.includes('Sources failed'),
        html
      )
    }
  })
