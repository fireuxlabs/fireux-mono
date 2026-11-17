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
  const key = Symbol('menus-workspace')
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
    kitchenMenusWorkspaceKey: key,
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
  const index = load(
    base + 'menu-group/useMenuGroupIndex',
    'createMenuGroupIndex,useMenuGroupIndex',
    {
      ...deps,
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
    }
  )
  const workspace = load(
    base + 'menus/useKitchenMenusWorkspace',
    'useKitchenMenusWorkspace,useKitchenMenusWorkspaceState',
    {
      ...deps,
      createKitchenMenus: menus.createKitchenMenus,
      createMenuGroupIndex: index.createMenuGroupIndex,
    }
  )
  const prep = load(
    base + 'prep/useKitchenPrepWorkspace',
    'useKitchenPrepWorkspace,useKitchenPrepWorkspaceState',
    deps
  )
  return {
    menus,
    index,
    workspace,
    prep,
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
      entrance = f.workspace.useKitchenMenusWorkspace()
    },
    () => {
      const state = f.workspace.useKitchenMenusWorkspaceState()
      assert.equal(f.menus.useKitchenMenus(), state.menus)
      assert.equal(f.menus.useOptionalKitchenMenus(), state.menus)
      assert.equal(f.index.useMenuGroupIndex(), state.overview)
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
      entrance = f.prep.useKitchenPrepWorkspace()
    },
    () => children.push(f.prep.useKitchenPrepWorkspaceState())
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
        f.workspace.useKitchenMenusWorkspaceState,
        /require their workspace owner/
      )
      assert.throws(
        f.prep.useKitchenPrepWorkspaceState,
        /require their workspace owner/
      )
      assert.throws(f.index.useMenuGroupIndex, /require their workspace owner/)
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
  const { parse, compileScript } = await import('vue/compiler-sfc')
  const { default: ts } = await import('typescript')
  const f = fixture()
  const component = (name) => {
    const filename = new URL(
      `../runtime/kitchen/components/PrepAndProduction/${name}.vue`,
      import.meta.url
    ).pathname
    const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
    const script = compileScript(descriptor, { id: name, inlineTemplate: true })
    const code = ts.transpileModule(script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
    const exports = {}
    compileFunction(code, ['require', 'exports'])((id) => {
      if (id === 'vue') return Vue
      if (id.endsWith('/useKitchenPrepWorkspace')) return f.prep
      assert.fail(`Unexpected child dependency: ${id}`)
    }, exports)
    return exports.default
  }
  const Overview = component('Overview'),
    Create = component('Create')
  for (const outcome of ['ready', 'pending']) {
    f.kitchenOutcome.value = outcome
    const app = Vue.createSSRApp({
      setup() {
        const entrance = f.prep.useKitchenPrepWorkspace()
        assert.deepEqual(Object.keys(entrance), ['description'])
        return () => Vue.h('div', [Vue.h(Overview), Vue.h(Create)])
      },
    })
    app.component('UButton', {
      props: ['to', 'label'],
      setup: (props) => () => Vue.h('a', { href: props.to }, props.label),
    })
    const html = await renderToString(app)
    assert.ok(
      html.includes(
        outcome === 'ready' ? 'tools below' : 'Choose an available Kitchen'
      )
    )
    assert.ok(html.includes('href="/workspace/kitchen/prep/recipes"'))
  }
  assert.deepEqual(f.counts(), {
    menuReads: 0,
    overviewReads: 0,
    publishers: 0,
  })
})
