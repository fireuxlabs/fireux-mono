import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { parse, compileScript } from 'vue/compiler-sfc'
import { transpileModule, ModuleKind } from 'typescript'
import * as vue from 'vue'
import { renderToString } from 'vue/server-renderer'

const file = new URL(
  '../../../../runtime/components/layouts/default/Header.vue',
  import.meta.url
)

async function renderHeader(phase, hasWorkspace, subscription = 'business') {
  const calls = []
  const route = {
    path: '/kitchens',
    fullPath: '/kitchens?search=food#results',
    meta: { layout: 'default' },
  }
  const dependencies = {
    vue,
    'vue-router': { useRoute: () => route },
    '../../../app/composables/config/FireUXConfig': {
      useFireUXConfig: () => ({ appName: 'Example App' }),
    },
    '../../../workspace/composables/useWorkspaceEntryCta': {
      useWorkspaceEntryCta: () => {
        calls.push('workspace')
        return {
          hasWorkspaceEntry: vue.ref(hasWorkspace),
          workspaceEntryHref: vue.ref('/workspace/example'),
        }
      },
    },
    '../../../user/composables/session/useUserSession': {
      useUserSession: () => {
        calls.push('session')
        return {
          user: vue.ref({ display_name: 'Example Person' }),
          avatarSrc: vue.ref('/avatar.png'),
          subscription: vue.ref(subscription),
        }
      },
    },
    '../../../composables/fireux/firebase/useAuthPhase': {
      useAuthPhase: () => ({
        authPhase: vue.ref(phase),
        isSignedIn: vue.ref(phase === 'signed-in'),
      }),
    },
    '../../../composables/navigation/useNav': {
      useNav: (layout) => {
        assert.equal(layout.value, 'default')
        const items = [
          { label: 'Home', to: '/', key: 'home' },
          { label: 'Kitchens', to: '/kitchens' },
          { label: 'Menus', to: '/menus' },
          { label: 'Legal', to: '/legal', position: 'bottom' },
        ]
        return { desktop: vue.ref(items), mobile: vue.ref(items) }
      },
    },
    '../../../composables/media/useAvatarProxy': {
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (src) => src }),
    },
    '../../../composables/fireux/firebase/useAuth': {
      useAuth: () => ({ currentUser: vue.ref(null) }),
    },
  }
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const code = transpileModule(
    compileScript(descriptor, { id: 'header-test', inlineTemplate: true })
      .content,
    { compilerOptions: { module: ModuleKind.CommonJS, target: 9 } }
  ).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => {
      assert.ok(id in dependencies, `Unexpected dependency: ${id}`)
      return dependencies[id]
    },
    module,
    module.exports
  )
  const app = vue.createSSRApp(module.exports.default)
  app.component('ClientOnly', {
    setup:
      (_, { slots }) =>
      () =>
        slots.default?.(),
  })
  app.component('UHeader', {
    setup:
      (_, { slots }) =>
      () =>
        vue.h('header', [
          ...['title', 'default', 'right', 'body'].map((name) =>
            vue.h('section', { 'data-region': name }, slots[name]?.())
          ),
        ]),
  })
  app.component('UButton', {
    props: ['to', 'label'],
    setup:
      (props, { slots }) =>
      () => {
        const href =
          typeof props.to === 'string'
            ? props.to
            : `${props.to.path}?${new URLSearchParams(props.to.query)}`
        return vue.h('a', { href }, props.label || slots.default?.())
      },
  })
  app.component('UNavigationMenu', {
    props: ['items'],
    setup: (props) => () =>
      vue.h(
        'nav',
        props.items.map((item) => vue.h('a', { href: item.to }, item.label))
      ),
  })
  app.component('AppUserAccessBadge', {
    props: ['subscription'],
    setup: (props) => () =>
      props.subscription ? vue.h('span', props.subscription) : null,
  })
  app.component('AppBrandWordmark', { render: () => vue.h('img') })
  app.component('UAvatar', { render: () => vue.h('img') })
  app.component('USkeleton', { render: () => vue.h('span', 'Pending account') })
  const html = await renderToString(app)
  const region = (name) =>
    html.match(
      new RegExp(`<section data-region="${name}">([\\s\\S]*?)</section>`)
    )[1]
  assert.deepEqual(calls, ['workspace', 'session'])
  return {
    right: region('right'),
    body: region('body'),
    nav: region('default'),
  }
}

for (const phase of ['guest', 'loading', 'signed-in']) {
  for (const hasWorkspace of [false, true]) {
    test(`Header preserves ${phase} account and navigation actions with Workspace ${hasWorkspace}`, async () => {
      const { right, body, nav } = await renderHeader(phase, hasWorkspace)
      assert.equal(right.includes('href="/workspace/example"'), hasWorkspace)
      assert.equal(body.includes('href="/workspace/example"'), hasWorkspace)
      if (hasWorkspace) assert.match(right, /fx-header-desktop-action/)
      assert.match(nav, /href="\/menus"/)
      assert.doesNotMatch(nav, /href="\/kitchens"/)
      assert.match(body, /href="\/kitchens"/)
      assert.match(body, /href="\/menus"/)
      assert.doesNotMatch(body, /href="\/legal"/)
      if (phase === 'guest') {
        assert.match(right, /Sign in/)
        assert.match(right, /redirect=%2Fkitchens%3Fsearch%3Dfood%23results/)
        assert.doesNotMatch(right + body, /business|Open Dashboard|Your plan/)
      } else if (phase === 'loading') {
        assert.match(right, /Pending account/)
        assert.doesNotMatch(right + body, /Sign in|Open Dashboard|Your plan/)
      } else {
        assert.match(right, /aria-label="Open Dashboard"/)
        assert.match(right, /href="\/dashboard"/)
        assert.match(right, /fx-header-desktop-action[^>]*>business/)
        assert.match(body, /Your plan.*business/)
        assert.doesNotMatch(right, /Sign in|Pending account/)
      }
    })
  }
}

test('Header omits the mobile plan label when no membership subscription exists', async () => {
  const { body, right } = await renderHeader('signed-in', false, null)
  assert.doesNotMatch(body, /Your plan|fx-header-menu-actions/)
  assert.match(right, /Open Dashboard/)
})
