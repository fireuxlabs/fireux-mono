import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  ref,
  watch,
} from 'vue'
import { parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'

function load(file, dependencies) {
  const source = stripTypeScriptTypes(
    readFileSync(new URL(file, import.meta.url), 'utf8')
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/export /g, '')
  return compileFunction(
    source + '\nreturn { provideMenuRecordView };',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const { provideMenuRecordView } = load(
  '../runtime/kitchen/composables/workspace/menu/menus/useMenuRecordView.ts',
  { ref, watch, onMounted: (fn) => fn(), provide: () => {}, inject: () => null }
)

test('regular and daily defaults, late loading, refresh and record replacement', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('user/kitchen/menu')
    const menu = ref(null)
    const state = provideMenuRecordView(scope, menu, () => null)
    menu.value = { id: 'daily', schedule: 'daily' }
    assert.equal(state.view.value, 'read')
    state.select('source')
    menu.value = null
    menu.value = { id: 'daily', schedule: 'daily' }
    assert.equal(
      state.view.value,
      'source',
      'temporary loading must not erase a chosen perspective'
    )
    menu.value = { id: 'regular', schedule: 'regular' }
    assert.equal(state.view.value, 'read')
  })
  owner.stop()
})

test('account, Kitchen and slug changes reset local view even with same record ID', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('a/k/food')
    const menu = ref({ id: 'food', schedule: 'regular' })
    const state = provideMenuRecordView(scope, menu, () => null)
    for (const next of ['b/k/food', 'b/other/food', 'b/other/drinks']) {
      state.select('publishing')
      scope.value = next
      assert.equal(state.view.value, 'read')
    }
  })
  owner.stop()
})

test('legacy intent overrides default once; a fresh mount returns to default', () => {
  const owner = effectScope()
  owner.run(() => {
    const scope = ref('a/k/food')
    const menu = ref({ id: 'food', schedule: 'daily' })
    let intent = 'source'
    const consume = () => {
      const value = intent
      intent = null
      return value
    }
    const state = provideMenuRecordView(scope, menu, consume)
    assert.equal(state.view.value, 'source')
    const reload = provideMenuRecordView(scope, menu, consume)
    assert.equal(reload.view.value, 'read')
  })
  owner.stop()
})

test('a discarded Nuxt page cannot consume the mounted record handoff', () => {
  const mounts = []
  const { provideMenuRecordView: prepare } = load(
    '../runtime/kitchen/composables/workspace/menu/menus/useMenuRecordView.ts',
    {
      ref,
      watch,
      onMounted: (fn) => mounts.push(fn),
      provide: () => {},
      inject: () => null,
    }
  )
  const scope = ref('a/k/food')
  const menu = ref({ id: 'food', schedule: 'regular' })
  let intent = 'content'
  const consume = () => {
    const next = intent
    intent = null
    return next
  }
  const discarded = effectScope()
  discarded.run(() => prepare(scope, menu, consume))
  discarded.stop()
  assert.equal(intent, 'content')
  const active = effectScope()
  let state
  active.run(() => {
    state = prepare(scope, menu, consume)
  })
  mounts[1]()
  assert.equal(state.view.value, 'content')
  assert.equal(intent, null)
  active.stop()
})

test('Menu overview composes the matching guest Menu and keeps draft sections readable', async () => {
  const path =
    '../runtime/kitchen/components/Workspace/Menu/Menus/Detail/Index.vue'
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const script = stripTypeScriptTypes(
    descriptor.scriptSetup.content.replace(
      /^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,
      ''
    )
  )

  async function render(status, audience, view = 'read', isTenant = false) {
    const deps = {
      computed,
      useFireUXConfig: () => ({ isTenant }),
      provideKitchenMenuRecordContext: () => ({
        menu: ref({ id: 'menu-id', status, audience }),
        menuSlug: ref('comida-casera-2'),
        pending: ref(false),
        error: ref(null),
        outcome: ref('ready'),
        canWrite: ref(true),
        subscription: ref('pro'),
        selectedKitchen: ref({ identity: { slug: 'la-tapberne' } }),
        sections: ref([{ id: 'starters', label: 'Starters' }]),
      }),
      useMenuRecordNavigation: () => ({ scope: ref('scope') }),
      provideMenuRecordView: () => ({ view: ref(view) }),
      directoryMenuRouteScope: (kitchenSlug) => ({
        kind: 'directory',
        kitchenSlug,
      }),
    }
    const setup = compileFunction(
      script +
        '\nreturn { menu, menuSlug, pending, error, outcome, canWrite, subscription, selectedKitchen, sections, publicMenuScope, recordScope, view, viewLabel }',
      Object.keys(deps)
    )
    const app = createSSRApp({
      setup: () => setup(...Object.values(deps)),
      render: compile(descriptor.template.content),
    })
    app.config.warnHandler = () => {}
    app.component('KitchenWorkspaceMenuMenusDetailHeader', {
      render: () => h('h1', 'Workspace Menu'),
    })
    app.component('KitchenWorkspaceMenuMenusSectionsCollection', {
      render: () => h('div', 'Menu editor'),
    })
    app.component('MenuDetail', {
      props: { menuId: String, menuRouteScope: Object, embedded: Boolean },
      setup: (props) => () =>
        h(
          'div',
          `${props.menuRouteScope.kitchenSlug}/${props.menuId}/${props.embedded}`
        ),
    })
    return renderToString(app)
  }

  const published = await render('published', 'public')
  assert.match(
    published,
    /Workspace Menu[\s\S]*la-tapberne\/comida-casera-2\/true/
  )
  assert.doesNotMatch(published, /Menu editor/)
  for (const [status, audience, isTenant] of [
    ['draft', 'public', false],
    ['published', 'private_link', false],
    ['published', 'public', true],
  ]) {
    const workspace = await render(status, audience, 'read', isTenant)
    assert.match(workspace, /Workspace Menu[\s\S]*Starters/)
    assert.doesNotMatch(workspace, /la-tapberne\/comida-casera-2|Menu editor/)
  }
  assert.match(await render('published', 'public', 'content'), /Menu editor/)
})
