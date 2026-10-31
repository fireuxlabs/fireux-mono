import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
const runtime = new URL('../runtime/', import.meta.url)
function component(relative, dependencies = {}) {
  const filename = new URL(relative, runtime).pathname
  const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
  const script = compileScript(descriptor, {
    id: filename,
    inlineTemplate: true,
  })
  const code = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    if (dependencies[id]) return dependencies[id]
    assert.equal(id, 'vue')
    return Vue
  }, exports)
  return exports.default
}
async function render(Card, props) {
  const app = Vue.createSSRApp({ render: () => Vue.h(Card, props) })
  app.component('UCard', {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h('div', [slots.header?.(), slots.default?.()]),
  })
  app.component('UBadge', {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h('span', slots.default?.()),
  })
  app.component('UAlert', {
    props: ['title'],
    setup: (p) => () => Vue.h('p', p.title),
  })
  app.component('UButton', {
    props: ['to'],
    setup:
      (p, { slots }) =>
      () =>
        Vue.h('a', { href: p.to }, slots.default?.()),
  })
  app.component('KitchenFoodAndDrinkMenusCreate', {
    render: () => Vue.h('div', 'Existing Kitchen creation controls'),
  })
  app.component('UPageLinks', {
    props: ['links'],
    render() {
      return Vue.h(
        'nav',
        this.links.map((link) => Vue.h('a', { href: link.to }, link.label))
      )
    },
  })
  return renderToString(app)
}
const File = component(
  'kitchen/components/FoodAndDrink/Menus/Uploads/Detail/File.vue'
)
test('upload detail preserves URL, photo, document and missing-file presentation', async () => {
  const base = {
    id: 'source',
    status: 'uploaded',
    file_name: 'Menu',
    files: [],
  }
  const url = await render(File, {
    source: { ...base, source_url: 'https://example.test/menu' },
    files: [],
  })
  assert.match(url, /Menu URL source/)
  assert.match(url, /href="https:\/\/example.test\/menu"/)
  assert.doesNotMatch(url, /<iframe|<img/)
  for (const [kind, tag] of [
    ['photo', 'img'],
    ['pdf', 'iframe'],
  ]) {
    const html = await render(File, {
      source: {
        ...base,
        file_kind: kind,
        file_url: 'https://example.test/file',
      },
      files: [
        { file_url: 'https://example.test/file' },
        { file_url: 'https://example.test/second' },
      ],
    })
    assert.match(
      html,
      new RegExp(`<${tag}[^>]*src="https://example.test/file"`)
    )
    assert.match(html, /href="https:\/\/example.test\/second"/)
  }
  assert.match(
    await render(File, { source: base, files: [] }),
    /Source file unavailable/
  )
})
test('QR targets retain publication and service eligibility boundaries', () => {
  const source = readFileSync(
    new URL('kitchen/composables/workspace/menus/useMenuQrTargets.ts', runtime),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const menu = { id: 'm', slug: 'food', name: 'Food', status: 'published' }
  const service = (id, overrides = {}) => ({
    id,
    name: id,
    enabled: true,
    menu_ids: ['m'],
    hours: { timezone: 'Europe/Zurich', windows: [{}] },
    interactions: [{ type: 'collection', enabled: true }],
    ...overrides,
  })
  const menus = Vue.ref([
    menu,
    { ...menu, id: 'draft', slug: 'draft', status: 'draft' },
    {
      ...menu,
      id: 'doc',
      slug: 'doc',
      doc: { url: 'https://example.test/menu.pdf' },
    },
  ])
  const offerings = Vue.ref([
    service('open'),
    service('paused', {
      interactions: [
        { type: 'collection', enabled: true, availability: { paused: true } },
      ],
    }),
    service('disabled', { enabled: false }),
    service('unlinked', { menu_ids: [] }),
    service('no-hours', { hours: null }),
  ])
  const deps = {
    computed: Vue.computed,
    useKitchenWorkspaceMenuSources: () => ({ menuSources: Vue.ref([]) }),
    useKitchenWorkspaceMenus: () => ({
      selectedKitchen: Vue.ref({ slug: 'venue' }),
      menus,
      storageKitchenId: Vue.ref('kitchen-ready'),
      outcome: Vue.ref('ready'),
    }),
    useKitchenOfferingCollection: (id) => {
      assert.equal(id.value, 'kitchen-ready')
      return { offerings, outcome: Vue.ref('ready') }
    },
    useRequestURL: () => ({ origin: 'https://example.test' }),
    useFireUXConfig: () => ({ isTenant: false }),
    menuWebsiteOrigin: (origin) => origin,
    menuRoutePath: ({ menuId, context = 'generic', offeringId }) =>
      `/menus/${menuId}.${context}${offeringId ? '?offering=' + offeringId : ''}`,
    menuRouteProjection: () => 'order',
    directoryMenuRouteScope: () => ({}),
    tenantMenuRouteScope: () => ({}),
    kitchenOrderTypeLabel: (type) => type,
    publicMenuSurfaceProfiles: [
      {
        context: 'collection',
        label: 'Collection',
        visibleOrderTypes: ['collection'],
      },
    ],
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuQrTargets()`,
    Object.keys(deps)
  )(...Object.values(deps))
  assert.deepEqual(
    api.menuPanels.value[0].targets.map((target) => target.id),
    ['m:default', 'm:open:collection']
  )
  assert.deepEqual(api.menuPanels.value[1].targets, [])
  assert.equal(api.menuPanels.value[2].targets.length, 1)
  offerings.value = []
  assert.deepEqual(
    api.menuPanels.value[0].targets.map((target) => target.id),
    ['m:default']
  )
})

test('an applied source retains its Menu destination after reload', async () => {
  const Apply = component(
    'kitchen/components/FoodAndDrink/Menus/Process/Review/Apply.vue'
  )
  const html = await render(Apply, {
    appId: 'misebox-app',
    kitchenId: 'kitchen-a',
    menuId: 'source-a',
    authToken: 'fixture',
    source: {
      id: 'source-a',
      ai_draft: {
        name: 'Reviewed Menu',
        sections: [{ label: 'Food', items: [{ name: 'Soup' }] }],
        applied: { slug: 'reviewed-menu', menu_written: true },
      },
    },
  })
  assert.match(
    html,
    /href="\/workspace\/kitchen\/food-and-drink\/menus\/reviewed-menu\?kitchenId=kitchen-a"/
  )
  assert.match(html, /This menu draft has already been applied/)
})

test('Kitchen Menu preparation is usable without a Product, purchase or service request', async () => {
  const Express = component(
    'kitchen/components/FoodAndDrink/Menus/Prepare.vue',
    {
      '../../../composables/workspace/menus/useKitchenMenusContext': {
        useKitchenMenusContext: () => ({
          outcome: Vue.ref('ready'),
          error: Vue.ref(null),
        }),
      },
      '../../../composables/workspace/menus/useKitchenWorkspaceMenuSources': {
        useKitchenWorkspaceMenuSources: () => ({
          menuSources: Vue.ref([
            { id: 'saved-source', file_name: 'TEST-menu.pdf' },
          ]),
          menuSourcesError: Vue.ref(null),
          outcome: Vue.ref('ready'),
        }),
      },
    }
  )
  const html = await render(Express, {})
  assert.match(html, /Existing Kitchen creation controls/)
  assert.match(html, /menus\/uploads\/saved-source/)
  assert.match(html, /Review and publish prepared Menus/)
  assert.match(html, /Download Menu QR/)
  assert.doesNotMatch(html, /checkout|Record demo payment/)
})
