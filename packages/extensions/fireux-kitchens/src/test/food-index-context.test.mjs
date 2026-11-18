import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'

function load(path, result, deps) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `; return { ${result} }`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const base = 'kitchen/composables/workspace/'

// Real Vue component ancestry and effect disposal, without a browser or backend.
function mount(parentSetup, childSetup) {
  const node = () => ({ children: [], parent: null })
  const renderer = Vue.createRenderer({
    createElement: node,
    createText: node,
    createComment: node,
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: (n) => n.parent,
    nextSibling: () => null,
    insert(n, parent) {
      n.parent = parent
      parent.children.push(n)
    },
    remove(n) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1)
    },
  })
  const Child = {
    setup() {
      childSetup()
      return () => Vue.h('span')
    },
  }
  const app = renderer.createApp({
    setup() {
      parentSetup()
      return () => Vue.h('div', [Vue.h(Child), Vue.h(Child)])
    },
  })
  app.mount(node())
  return app
}

function fixture() {
  const menuState = load(
    base + 'menu/state',
    'kitchenMenusWorkspaceKey,requireMenuWorkspace',
    Vue
  )
  const prepState = load(
    base + 'prep/state',
    'prepWorkspaceKey,requirePrepWorkspace',
    Vue
  )
  const kitchenName = Vue.ref('La Tap')
  const kitchenOutcome = Vue.ref('ready')
  const menuOutcome = Vue.ref('empty')
  const selectedId = Vue.ref('k')
  const collection = {}
  const publications = []
  let menuReads = 0,
    overviewReads = 0,
    publishers = 0
  const lower = {
    menuCollection: collection,
    menus: Vue.ref([]),
    rawMenus: Vue.ref([]),
    selectedMenuId: Vue.ref(''),
    selectedMenu: Vue.ref(null),
    kitchenId: selectedId,
    outcome: menuOutcome,
    canCreateMenu: Vue.ref(true),
    canWrite: Vue.ref(true),
    menuCount: Vue.ref(0),
    menuLimit: Vue.ref(1),
    subscription: Vue.ref('free'),
    menuCreateBlockedMessage: Vue.ref(''),
    error: Vue.ref(null),
  }
  const useKitchenWorkspace = () => ({
    kitchenName,
    outcome: kitchenOutcome,
    id: selectedId,
  })
  const deps = {
    ...Vue,
    kitchenMenusWorkspaceKey: menuState.kitchenMenusWorkspaceKey,
    prepWorkspaceKey: prepState.prepWorkspaceKey,
    useKitchenWorkspace,
    useWorkspacePageState: () => {
      publishers++
      return { publish: (v) => publications.push(v) }
    },
  }
  const menus = load(
    base + 'menus/useKitchenMenus',
    'createKitchenMenus,provideKitchenMenus,useKitchenMenus,useOptionalKitchenMenus',
    {
      ...deps,
      useKitchenWorkspaceMenus: () => {
        menuReads++
        return lower
      },
      defineWorkspaceCapabilityContext: (v) => v,
    }
  )
  const services = load(
    base + 'menu/services',
    'createMenuServices,useKitchenWorkspaceMenuServices',
    {
      ...deps,
      requireMenuWorkspace: menuState.requireMenuWorkspace,
      useKitchenOfferingNow: () => ({ now: Vue.ref(new Date()) }),
      resolveServiceHours: (value) => value,
      foodServiceSummary: () => [],
      serviceOverviewSnapshot: () => ({ services: [] }),
    }
  )
  const index = load(base + 'menu/source', 'createKitchenMenuOverview', {
    ...deps,
    createMenuServices: services.createMenuServices,
    useKitchenOfferings: (id, supplied) => {
      assert.equal(id, selectedId)
      assert.equal(supplied, collection)
      overviewReads++
      return {
        kitchenId: selectedId,
        storageKitchenId: selectedId,
        offerings: Vue.ref([]),
        menus: lower.menus,
        outcome: kitchenOutcome,
        menusOutcome: menuOutcome,
        placeOutcome: Vue.ref('ready'),
        kitchenHours: Vue.ref({}),
        canWrite: lower.canWrite,
      }
    },
    useFoodCatalogueSummary: () => Vue.ref({}),
    useKitchenOfferingNow: () => ({ now: Vue.ref(new Date()) }),
    resolveServiceHours: (v) => v,
    foodServiceSummary: () => [],
    serviceOverviewSnapshot: () => ({ services: [] }),
  })
  const workspace = load(base + 'menu/index', 'useKitchenWorkspaceMenu', {
    ...deps,
    createKitchenMenus: menus.createKitchenMenus,
    createKitchenMenuOverview: index.createKitchenMenuOverview,
  })
  const prepInputs = {
    preparations: { preparations: Vue.ref([]), outcome: Vue.ref('empty') },
    recipes: { recipes: Vue.ref([]), outcome: Vue.ref('empty') },
    ingredients: { items: Vue.ref([]), outcome: Vue.ref('empty') },
    stations: { items: Vue.ref([]), outcome: Vue.ref('empty') },
  }
  const prepAcquisitions = []
  const acquire = (name, id) => {
    prepAcquisitions.push({ name, id })
    return prepInputs[name]
  }
  const summaries = load(base + 'prep/summaries', 'createPrepSummaries', {
    ...Vue,
    useKitchenPreparationsRead: (id) => acquire('preparations', id),
    useKitchenRecipesRead: (id) => acquire('recipes', id),
    useKitchenChildCollection: (name, id, options) => {
      assert.equal(options.kitchenCollectionPath, 'kitchens')
      return acquire(name, id)
    },
  })
  const prepChildren = load(
    base + 'prep/children',
    'useKitchenWorkspacePrepPreparations,useKitchenWorkspacePrepRecipes,useKitchenWorkspacePrepIngredients,useKitchenWorkspacePrepStations',
    { ...Vue, requirePrepWorkspace: prepState.requirePrepWorkspace }
  )
  const prep = load(base + 'prep/index', 'useKitchenWorkspacePrep', {
    ...deps,
    createPrepSummaries: summaries.createPrepSummaries,
  })
  return {
    menus,
    index,
    menuState,
    prepState,
    services,
    workspace,
    prep,
    prepChildren,
    prepInputs,
    prepAcquisitions,
    kitchenName,
    kitchenOutcome,
    selectedId,
    publications,
    counts: () => ({ menuReads, overviewReads, publishers }),
  }
}

test('Menu mounts one state object; every child getter reuses it and the exact collection', async () => {
  const f = fixture(),
    children = []
  let entrance
  const app = mount(
    () => {
      entrance = f.workspace.useKitchenWorkspaceMenu()
    },
    () => {
      const state = f.menuState.requireMenuWorkspace()
      assert.equal(f.menus.useKitchenMenus(), state.menus)
      assert.equal(f.menus.useOptionalKitchenMenus(), state.menus)
      assert.equal(
        f.services.useKitchenWorkspaceMenuServices().rows,
        state.overview.services.rows
      )
      children.push(state)
    }
  )
  assert.deepEqual(Object.keys(entrance), ['description'])
  assert.equal(children[0], children[1])
  assert.equal(children[0].description, entrance.description)
  assert.deepEqual(f.counts(), {
    menuReads: 1,
    overviewReads: 1,
    publishers: 2,
  })
  // The capability's publisher is disabled: only the combined group publishes.
  assert.equal(f.publications.length, 1)
  assert.equal(
    entrance.description.value,
    "Manage La Tap's menus, items, promotions and services"
  )
  f.kitchenName.value = 'Other kitchen'
  f.selectedId.value = 'other'
  await Vue.nextTick()
  assert.match(entrance.description.value, /Other kitchen/)
  assert.equal(f.publications.at(-1).selected.kitchenId, 'other')
  assert.deepEqual(f.counts(), {
    menuReads: 1,
    overviewReads: 1,
    publishers: 2,
  })
  app.unmount()
  assert.deepEqual(f.publications.at(-1), { derived: { outcome: 'idle' } })
  const count = f.publications.length
  f.selectedId.value = 'after-disposal'
  await Vue.nextTick()
  assert.equal(f.publications.length, count)
})

test('Prep mounts one state object; children reuse reactive readiness and parent gets only description', async () => {
  const f = fixture(),
    children = []
  let entrance
  const app = mount(
    () => {
      entrance = f.prep.useKitchenWorkspacePrep()
    },
    () => children.push(f.prepState.requirePrepWorkspace())
  )
  assert.deepEqual(Object.keys(entrance), ['description'])
  assert.equal(children[0], children[1])
  assert.equal(children[0].description, entrance.description)
  assert.equal(children[0].ready.value, true)
  assert.equal(children[0].createTo, '/workspace/kitchen/prep/recipes')
  f.kitchenOutcome.value = 'pending'
  f.kitchenName.value = 'Another'
  await Vue.nextTick()
  assert.equal(children[0].ready.value, false)
  assert.match(entrance.description.value, /Another/)
  assert.deepEqual(f.counts(), {
    menuReads: 0,
    overviewReads: 0,
    publishers: 0,
  })
  app.unmount()
})

test('required child access without a mounted group fails without constructing state; optional Menus is absent', () => {
  const f = fixture()
  const app = mount(
    () => {},
    () => {
      assert.throws(
        f.menuState.requireMenuWorkspace,
        /require their workspace owner/
      )
      assert.throws(
        f.prepState.requirePrepWorkspace,
        /require their workspace owner/
      )
      for (const useChild of Object.values(f.prepChildren))
        assert.throws(useChild, /require their workspace owner/)
      assert.throws(
        f.services.useKitchenWorkspaceMenuServices,
        /require their workspace owner/
      )
      assert.throws(f.menus.useKitchenMenus, /not available/)
      assert.equal(f.menus.useOptionalKitchenMenus(), null)
    }
  )
  assert.deepEqual(f.counts(), {
    menuReads: 0,
    overviewReads: 0,
    publishers: 0,
  })
  app.unmount()
})

test('standalone menu preparation mounts a capability without a group owner', () => {
  const f = fixture()
  let owner
  const app = mount(
    () => {
      owner = f.menus.provideKitchenMenus()
    },
    () => {
      assert.equal(f.menus.useKitchenMenus(), owner)
    }
  )
  assert.deepEqual(f.counts(), {
    menuReads: 1,
    overviewReads: 0,
    publishers: 1,
  })
  assert.equal(f.publications.length, 1)
  app.unmount()
})

test('actual Prep overview and create consumers render the mounted state without constructing it', async () => {
  const { renderToString } = await import('vue/server-renderer')
  const { parse, compileScript, compileTemplate } = await import(
    'vue/compiler-sfc'
  )
  const { default: ts } = await import('typescript')
  const f = fixture()
  const component = (name) => {
    const filename = new URL(
      `../runtime/kitchen/components/Workspace/Prep/${name}.vue`,
      import.meta.url
    ).pathname
    const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
    const content =
      descriptor.scriptSetup || descriptor.script
        ? compileScript(descriptor, { id: name, inlineTemplate: true }).content
        : `${compileTemplate({ source: descriptor.template.content, filename, id: name }).code}
export default {render}`
    const code = ts.transpileModule(content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
    const exports = {}
    compileFunction(code, ['require', 'exports'])((id) => {
      if (id === 'vue') return Vue
      if (id === './index' && name === 'Overview/Index')
        return {
          Controls: component('Overview/Controls'),
          Collection: component('Overview/Collection'),
        }
      if (id.endsWith('/prep/state')) return f.prepState
      if (id === './useOverview') {
        const child = name.split('/')[0]
        return load(
          `kitchen/components/Workspace/Prep/${child}/useOverview`,
          `useKitchenWorkspacePrep${child}Overview`,
          {
            ...Vue,
            ...f.prepChildren,
            ...load('kitchen/utils/overview-summary', 'overviewSummary', {}),
          }
        )
      }
      assert.fail(`Unexpected child dependency: ${id}`)
    }, exports)
    return exports.default
  }
  const Overview = component('Overview/Index'),
    Create = component('Create')
  const cards = ['Preparations', 'Recipes', 'Ingredients', 'Stations'].map(
    (name) => component(`${name}/Overview`)
  )
  for (const scenario of [
    'ready',
    'pending',
    'error',
    'empty',
    'isolated-error',
  ]) {
    const outcome = scenario === 'isolated-error' ? 'ready' : scenario
    f.kitchenOutcome.value = outcome
    f.prepInputs.ingredients.outcome.value =
      scenario === 'isolated-error' ? 'error' : 'empty'
    const app = Vue.createSSRApp({
      setup() {
        const entrance = f.prep.useKitchenWorkspacePrep()
        assert.deepEqual(Object.keys(entrance), ['description'])
        return () =>
          Vue.h('div', [
            Vue.h(Overview),
            Vue.h(Create),
            ...cards.map((card) => Vue.h(card)),
          ])
      },
    })
    app.component('UPageCard', {
      props: ['to', 'title'],
      setup:
        (props, { slots }) =>
        () =>
          Vue.h('article', [
            Vue.h('a', { href: props.to }, props.title),
            slots.default?.(),
          ]),
    })
    app.component('UButton', {
      props: ['to', 'label'],
      setup: (props) => () => Vue.h('a', { href: props.to }, props.label),
    })
    app.component('WorkspaceKitchenCollectionToolbar', {
      render: () => Vue.h('div'),
    })
    const html = await renderToString(app)
    assert.ok(html.includes('Your preparations'))
    assert.equal(html.includes('No preparations yet.'), outcome === 'ready')
    assert.ok(html.includes('href="/workspace/kitchen/prep/recipes"'))
    const articles = [
      ...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g),
    ].map((match) => match[1])
    assert.equal(articles.length, 4)
    const alerts = articles.filter((article) =>
      article.includes('role="alert"')
    )
    assert.equal(
      alerts.length,
      scenario === 'error' ? 4 : scenario === 'isolated-error' ? 1 : 0
    )
    if (outcome === 'ready') {
      for (const status of ['0 preparations', '0 recipes', '0 stations'])
        assert.ok(html.includes(status))
      if (scenario === 'isolated-error') {
        const ingredientCard = articles.find((article) =>
          article.includes('>Ingredients</a>')
        )
        assert.ok(ingredientCard.includes('Could not load this summary.'))
        assert.ok(!ingredientCard.includes('0 selected ingredients'))
      } else assert.ok(html.includes('0 selected ingredients'))
    } else {
      assert.ok(
        articles.every(
          (article) =>
            !/0 (?:preparations|recipes|selected ingredients|stations)/.test(
              article
            )
        )
      )
      const message =
        outcome === 'error'
          ? 'Could not load this summary.'
          : outcome === 'empty'
            ? 'Choose an available Kitchen.'
            : 'Loading…'
      assert.ok(articles.every((article) => article.includes(message)))
    }
    assert.ok(html.includes('href="/workspace/kitchen/stations"'))
  }
  assert.deepEqual(f.counts(), {
    menuReads: 0,
    overviewReads: 0,
    publishers: 0,
  })
})

test('Prep children share one gated acquisition graph and reactive honest summaries', async () => {
  const f = fixture()
  const children = []
  const app = mount(
    () => f.prep.useKitchenWorkspacePrep(),
    () => children.push(f.prepState.requirePrepWorkspace())
  )
  assert.equal(children[0].summaries, children[1].summaries)
  assert.deepEqual(
    f.prepAcquisitions.map(({ name }) => name),
    ['preparations', 'recipes', 'ingredients', 'stations']
  )
  const ids = f.prepAcquisitions.map(({ id }) => id)
  assert.ok(ids.every((id) => id === ids[0] && id.value === 'k'))
  const summaries = children[0].summaries
  assert.equal(summaries.value.preparations.status, '0 preparations')
  assert.equal(summaries.value.ingredients.status, '0 selected ingredients')
  f.prepInputs.recipes.recipes.value = [{ inputs: [], method: [] }]
  f.prepInputs.recipes.outcome.value = 'ready'
  assert.equal(summaries.value.recipes.status, '1 recipe')
  assert.equal(summaries.value.recipes.flags.length, 2)
  f.prepInputs.recipes.recipes.value = [{ inputs: [{}], method: ['Cook'] }]
  assert.deepEqual(summaries.value.recipes.flags, [])
  f.prepInputs.ingredients.items.value = [{ ingredient_id: 'i' }]
  f.prepInputs.ingredients.outcome.value = 'pending'
  assert.equal(summaries.value.ingredients.status, 'Loading…')
  f.prepInputs.ingredients.outcome.value = 'error'
  assert.equal(summaries.value.ingredients.outcome, 'error')
  assert.equal(summaries.value.preparations.outcome, 'ready')
  f.prepInputs.ingredients.outcome.value = 'ready'
  assert.equal(summaries.value.ingredients.status, '1 selected ingredient')
  f.kitchenOutcome.value = 'pending'
  assert.ok(ids.every((id) => id.value === ''))
  assert.ok(
    Object.values(summaries.value).every((v) => v.outcome === 'pending')
  )
  f.selectedId.value = 'other'
  f.kitchenOutcome.value = 'ready'
  assert.ok(ids.every((id) => id.value === 'other'))
  assert.equal(f.prepAcquisitions.length, 4)
  f.kitchenOutcome.value = 'error'
  assert.ok(Object.values(summaries.value).every((v) => v.outcome === 'error'))
  f.prepInputs.ingredients.outcome.value = 'error'
  f.kitchenOutcome.value = 'empty'
  assert.ok(Object.values(summaries.value).every((v) => v.outcome === 'idle'))
  app.unmount()
})

test('local Menu overview presenters consume one domain source and preserve reactive feedback', () => {
  const { overviewSummary } = load(
    'kitchen/utils/overview-summary',
    'overviewSummary',
    {}
  )
  for (const child of ['Items', 'Promotions']) {
    const summary = Vue.ref({
      outcome: 'ready',
      status: '3 records',
      flags: ['Needs attention'],
    })
    let acquisitions = 0
    const name = `useKitchenWorkspaceMenu${child}`
    const local = load(
      `kitchen/components/Workspace/Menu/${child}/useOverview`,
      `${name}Overview`,
      {
        ...Vue,
        overviewSummary,
        [name]: () => {
          acquisitions++
          return { summary }
        },
      }
    )
    const { overview } = local[`${name}Overview`]()
    assert.deepEqual(overview.value, {
      message: '3 records',
      flags: ['Needs attention'],
    })
    summary.value.outcome = 'pending'
    assert.deepEqual(overview.value, {
      message: 'Loading…',
      role: 'status',
      flags: [],
    })
    summary.value.outcome = 'error'
    assert.deepEqual(overview.value, {
      message: 'Could not load this summary.',
      role: 'alert',
      flags: [],
    })
    assert.equal(acquisitions, 1)
  }
})

test('local Services overview derives badge and accessible setup copy without changing domain facts', () => {
  const rows = Vue.ref([
    {
      name: 'Collection',
      open: true,
      needsSetup: false,
      issues: [],
      label: 'Open',
    },
    {
      name: 'Delivery',
      open: false,
      needsSetup: true,
      issues: ['Set hours'],
      label: 'Closed',
    },
    {
      name: 'Table service',
      open: false,
      needsSetup: false,
      issues: [],
      label: 'Closed',
    },
  ])
  const pending = Vue.ref(false),
    failed = Vue.ref(false)
  let acquisitions = 0
  const { useKitchenWorkspaceMenuServicesOverview } = load(
    'kitchen/components/Workspace/Menu/Services/useOverview',
    'useKitchenWorkspaceMenuServicesOverview',
    {
      ...Vue,
      useKitchenWorkspaceMenuServices: () => {
        acquisitions++
        return { rows, pending, failed }
      },
    }
  )
  const overview = useKitchenWorkspaceMenuServicesOverview()
  assert.equal(overview.pending, pending)
  assert.equal(overview.failed, failed)
  assert.deepEqual(
    overview.rows.value.map((row) => row.badgeColor),
    ['success', 'warning', 'neutral']
  )
  assert.equal(
    overview.rows.value[1].setupLabel,
    'Configure Delivery: Set hours'
  )
  assert.equal(overview.rows.value[1].badgeLabel, 'Set hours')
  rows.value[1].issues = []
  rows.value[1].needsSetup = false
  assert.equal(overview.rows.value[1].badgeColor, 'neutral')
  assert.equal(overview.rows.value[1].badgeLabel, 'Closed')
  assert.equal(overview.rows.value[1].setupLabel, undefined)
  assert.equal(acquisitions, 1)
})

test('actual Services overview renders feedback and title-only navigation through its local presenter', async () => {
  const { renderToString } = await import('vue/server-renderer')
  const { parse, compileScript } = await import('vue/compiler-sfc')
  const { default: ts } = await import('typescript')
  const rows = Vue.ref([]),
    pending = Vue.ref(false),
    failed = Vue.ref(false)
  const local = load(
    'kitchen/components/Workspace/Menu/Services/useOverview',
    'useKitchenWorkspaceMenuServicesOverview',
    {
      ...Vue,
      useKitchenWorkspaceMenuServices: () => ({ rows, pending, failed }),
    }
  )
  function component(path, dependencies) {
    const filename = new URL(
      `../runtime/kitchen/components/Workspace/${path}.vue`,
      import.meta.url
    ).pathname
    const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
    const script = compileScript(descriptor, { id: path, inlineTemplate: true })
    const code = ts.transpileModule(script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
    const exports = {}
    compileFunction(code, ['require', 'exports'])((id) => {
      if (id === 'vue') return Vue
      if (dependencies[id]) return dependencies[id]
      assert.fail(`Unexpected Services dependency: ${id}`)
    }, exports)
    return exports.default
  }
  const Navigation = component('Navigation/Child', {
    'fireux-core/runtime/composables/navigation/useNav': {
      useNav: () => ({
        items: Vue.ref([
          {
            key: 'workspace-kitchen-menu-group',
            children: [
              {
                key: 'services',
                label: 'Services',
                to: '/workspace/kitchen/menu/services',
              },
            ],
          },
        ]),
      }),
    },
  })
  const Overview = component('Menu/Services/Overview', {
    './useOverview': local,
  })
  for (const scenario of ['pending', 'error', 'empty', 'rows']) {
    pending.value = scenario === 'pending'
    failed.value = scenario === 'error'
    rows.value =
      scenario === 'rows'
        ? [
            {
              key: 'collection',
              name: 'Collection',
              to: '/workspace/kitchen/menu/services#collection',
              open: true,
              needsSetup: false,
              issues: [],
              label: 'Serving now',
            },
            {
              key: 'delivery',
              name: 'Delivery',
              to: '/workspace/kitchen/menu/services#delivery',
              open: false,
              needsSetup: true,
              issues: ['Set serving hours'],
              label: 'Needs setup',
            },
            {
              key: 'table',
              name: 'Table service',
              to: '/workspace/kitchen/menu/services#table',
              open: false,
              needsSetup: false,
              issues: [],
              label: 'Closed',
            },
          ]
        : []
    const app = Vue.createSSRApp(Overview)
    app.component('WorkspaceKitchenNavigationChild', Navigation)
    app.component('UPageCard', {
      props: ['to', 'title', 'icon'],
      setup:
        (props, { slots }) =>
        () => {
          assert.equal(
            props.to,
            undefined,
            'Services uses native title navigation, without a card overlay'
          )
          return Vue.h('article', [slots.title?.(), slots.default?.()])
        },
    })
    app.component('NuxtLink', {
      props: ['to'],
      setup:
        (props, { slots, attrs }) =>
        () =>
          Vue.h('a', { href: props.to, ...attrs }, slots.default?.()),
    })
    app.component('UBadge', {
      props: ['color', 'variant'],
      setup:
        (props, { slots }) =>
        () =>
          Vue.h('span', { 'data-color': props.color }, slots.default?.()),
    })
    const html = await renderToString(app)
    assert.ok(
      html.includes('href="/workspace/kitchen/menu/services">Services</a>')
    )
    if (scenario === 'pending')
      assert.ok(html.includes('role="status">Loading services…'))
    if (scenario === 'error')
      assert.ok(html.includes('role="alert">Services could not be loaded.'))
    if (scenario === 'empty') assert.ok(html.includes('No services enabled.'))
    if (scenario === 'rows') {
      for (const color of ['success', 'warning', 'neutral'])
        assert.ok(html.includes(`data-color="${color}"`))
      for (const hash of ['collection', 'delivery', 'table'])
        assert.ok(
          html.includes(`href="/workspace/kitchen/menu/services#${hash}"`)
        )
      assert.ok(
        html.includes('aria-label="Configure Delivery: Set serving hours"')
      )
      for (const text of ['Serving now', 'Set serving hours', 'Closed'])
        assert.ok(html.includes(text))
    }
    assert.ok(!html.includes('relative z-10'))
  }
  const defaultCard = Vue.createSSRApp(Navigation, {
    navKey: 'workspace-kitchen-menu-group',
    childKey: 'services',
  })
  defaultCard.component('UPageCard', {
    props: ['to', 'title', 'icon'],
    setup: (props) => () => Vue.h('a', { href: props.to }, props.title),
  })
  assert.ok(
    (await renderToString(defaultCard)).includes(
      'href="/workspace/kitchen/menu/services">Services</a>'
    ),
    'Other navigation cards retain whole-card destination by default'
  )
})
