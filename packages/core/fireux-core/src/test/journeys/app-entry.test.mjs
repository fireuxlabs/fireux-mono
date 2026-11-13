import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createSSRApp, h, ref } from 'vue'
import { transpileModule, ModuleKind } from 'typescript'

const root = new URL('../../../../../../', import.meta.url)
const require = createRequire(import.meta.url)
const vueRequire = createRequire(require.resolve('vue'))
const { parse, compileScript } = vueRequire('@vue/compiler-sfc')
const { renderToString } = vueRequire('@vue/server-renderer')

function manifest(
  query = {},
  origin = 'https://misebox.app',
  workspaceConfig = {},
  theme
) {
  const source = readFileSync(
    new URL(
      '../../runtime/server/manifest.webmanifest.get.ts',
      import.meta.url
    ),
    'utf8'
  )
  const code = stripTypeScriptTypes(
    source.replace(/^import .*?\n/gm, '')
  ).replace('export default ', 'return ')
  return compileFunction(code, [
    'defineEventHandler',
    'getQuery',
    'getRequestURL',
    'setHeader',
    'useRuntimeConfig',
    'useAppConfig',
    'resolveAppTheme',
    'brandAssets',
    'withBuildVersion',
  ])(
    (fn) => fn,
    () => query,
    () => new URL(origin),
    () => {},
    () => ({
      public: {
        fireux: {
          name: 'Misebox',
          shortName: 'Misebox',
          workspaces: ['kitchen'],
          workspaceConfig,
        },
      },
    }),
    () => ({ theme }),
    (value) => value,
    { pwaIcon192: '/192.png', pwaIcon512: '/512.png' },
    (url) => url
  )({})
}

test('Directory and Workspace manifests have stable separate identities and Home destinations', () => {
  assert.equal(manifest().start_url, '/')
  const workspace = manifest({
    surface: 'workspace',
    start_url: '/workspace/kitchen',
  })
  assert.equal(workspace.id, '/workspace/kitchen')
  assert.equal(workspace.name, 'Misebox Workspace')
  assert.equal(workspace.start_url, '/workspace/kitchen')
  assert.notEqual(workspace.id, manifest().id)
})
test('Workspace installation cannot target a private record, disabled family or external URL', () => {
  for (const start_url of [
    '/workspace/kitchen/team',
    '/workspace/property',
    '//evil.example',
    'https://evil.example',
    '/\\evil.example',
  ]) {
    const result = manifest({ surface: 'workspace', start_url })
    assert.equal(result.id, '/')
    assert.equal(result.name, 'Misebox')
  }
})
test('a declared Workspace origin installs at root, without accepting the retired home', () => {
  const origin = 'http://workspace.localhost:3001'
  const config = { kitchen: { origin } }
  const result = manifest(
    { surface: 'workspace', start_url: '/' },
    origin,
    config
  )
  assert.equal(result.id, '/')
  assert.equal(result.start_url, '/')
  assert.equal(result.name, 'Misebox Workspace')
  assert.equal(
    manifest(
      { surface: 'workspace', start_url: '/' },
      'http://localhost:3001',
      config
    ).name,
    'Misebox'
  )
  assert.equal(
    manifest(
      { surface: 'workspace', start_url: '/workspace/kitchen' },
      'http://localhost:3001',
      config
    ).name,
    'Misebox'
  )
  assert.equal(
    manifest(
      { surface: 'workspace', start_url: '/' },
      'http://workspace.localhost.example:3001',
      config
    ).name,
    'Misebox'
  )
  for (const start_url of [
    '/workspace/kitchen',
    '/workspace/kitchen/menu/menus',
    '/?kitchenId=private',
  ]) {
    const refused = manifest(
      { surface: 'workspace', start_url },
      origin,
      config
    )
    assert.equal(refused.start_url, '/')
    assert.equal(refused.name, 'Misebox')
  }
})

test('existing route-installed Kitchen kiosks retain their identity', () => {
  const url = '/menus/example?kiosk=1'
  assert.equal(manifest({ start_url: url }).id, url)
})

async function renderDirectory(state) {
  const path = new URL(
    'packages/extensions/fireux-properties/src/runtime/property/components/Directory/Index.vue',
    root
  )
  const { descriptor } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  const script = compileScript(descriptor, {
    id: 'property-directory',
    inlineTemplate: true,
  })
  const code = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const mod = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) =>
      id.includes('usePropertyDirectory')
        ? { usePropertyDirectory: () => state }
        : require(id),
    mod,
    mod.exports
  )
  const app = createSSRApp(mod.exports.default)
  app.component('PropertyCollection', {
    props: ['properties'],
    setup: (props) => () =>
      h('div', props.properties.map((p) => p.name).join(',')),
  })
  app.component('UAlert', {
    props: ['title', 'description'],
    setup:
      (p, { slots }) =>
      () =>
        h('div', [p.title, p.description, slots.actions?.()]),
  })
  app.component('UButton', {
    props: ['label'],
    setup: (p) => () => h('button', p.label),
  })
  return renderToString(app)
}
const state = (overrides = {}) => ({
  properties: ref([]),
  outcome: ref('empty'),
  refresh() {},
  hasMore: ref(false),
  loadingMore: ref(false),
  loadMore() {},
  loadMoreError: ref(null),
  ...overrides,
})

test('an empty published page with a remaining cursor still offers discovery pagination', async () => {
  const html = await renderDirectory(state({ hasMore: ref(true) }))
  assert.match(html, /More results are available to check/)
  assert.match(html, /Show more properties/)
})
test('ready discovery passes published properties into its registered Collection', async () => {
  const html = await renderDirectory(
    state({
      outcome: ref('ready'),
      properties: ref([{ name: 'Published stay' }]),
    })
  )
  assert.match(html, /Published stay/)
  assert.doesNotMatch(html, /No published properties/)
})
test('failed discovery never renders stale properties or claims an empty collection', async () => {
  const html = await renderDirectory(
    state({
      outcome: ref('error'),
      properties: ref([{ name: 'stale private data' }]),
    })
  )
  assert.match(html, /Properties could not be loaded/)
  assert.match(html, /Try again/)
  assert.doesNotMatch(html, /stale private data|No published properties/)
})

async function renderCell(cell) {
  const path = new URL(
    '../../runtime/components/Collection/Cell.vue',
    import.meta.url
  )
  const { descriptor } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  const script = compileScript(descriptor, {
    id: 'directory-cell',
    inlineTemplate: true,
  })
  const code = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const mod = { exports: {} }
  const link = {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  }
  compileFunction(code, ['require', 'module', 'exports'])(
    require,
    mod,
    mod.exports
  )
  const app = createSSRApp(mod.exports.default, { cell })
  app.component('NuxtLink', link)
  for (const name of ['UPageCard', 'UCard', 'UBadge', 'UAvatar', 'UIcon'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.leading?.(), slots.default?.(), slots.footer?.()]),
    })
  return renderToString(app)
}
test('informational discovery cards never render an empty-destination link', async () => {
  for (const imageStyle of [undefined, 'avatar', 'cover']) {
    const html = await renderCell({
      title: 'Published Property',
      to: '',
      imageStyle,
    })
    assert.match(html, /<article/)
    assert.doesNotMatch(html, /<a[ >]/)
    assert.doesNotMatch(html, /collection-cell--linked/)
    const linked = await renderCell({
      title: 'Kitchen',
      to: '/kitchens/example/menus',
      imageStyle,
    })
    assert.match(linked, /href="\/kitchens\/example\/menus"/)
    if (imageStyle) assert.match(linked, /collection-cell--linked/)
  }
})

async function renderSidebar({
  user = null,
  phase = 'guest',
  mounted = true,
  workspace = true,
  collapsed = false,
  homePath = '/home',
  entityPending = false,
  entityItem = { label: 'Alpine house', choices: [{ label: 'Lake house' }] },
  buttons = [],
  dropdowns = [],
} = {}) {
  const vue = require('vue')
  const auth = { currentUser: ref(user), signOutUser() {} }
  const config = { appShortName: 'Example', appName: 'Example App', homePath }
  const mocks = {
    vue: {
      ...vue,
      onMounted: (callback) => {
        if (mounted) callback()
      },
    },
    '#imports': {
      useRoute: () => ({
        path: '/workspace/property',
        meta: { workspace: 'property' },
        fullPath: '/workspace/property?from=directory#details',
      }),
      useNuxtApp: () => ({ vueApp: { component: (name) => name } }),
    },
    '../utils/sidebar-mode': { workspaceSidebarNext: () => ({}) },
    '../utils/routes': {
      workspaceFamilyFromRouteContext: () => 'property',
      toWorkspaceFamilyLabel: () => 'Property',
    },
    '../composables/useWorkspaceNav': {
      useWorkspaceNav: () => ({ desktop: ref([]) }),
    },
    '../utils/active-destination': { workspaceActiveDestination: () => null },
  }
  function component(file) {
    const path = new URL(`../../runtime/${file}`, import.meta.url)
    const { descriptor } = parse(readFileSync(path, 'utf8'), {
      filename: path.pathname,
    })
    const script = compileScript(descriptor, {
      id: file,
      inlineTemplate: true,
    })
    const code = transpileModule(script.content, {
      compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
    }).outputText
    const mod = { exports: {} }
    const importModule = (id) => {
      if (id in mocks) return mocks[id]
      if (id.endsWith('/FireUXConfig')) return { useFireUXConfig: () => config }
      if (id.endsWith('/useAuth')) return { useAuth: () => auth }
      if (id.endsWith('/useAuthPhase'))
        return {
          useAuthPhase: () => ({
            uid: ref(phase === 'signed-in' ? 'actor' : ''),
            isSignedIn: ref(phase === 'signed-in'),
            isGuest: ref(
              phase === 'guest' ||
                (phase === 'signed-in' && Boolean(user?.isAnonymous))
            ),
          }),
        }
      if (id.endsWith('/useUserRead'))
        return {
          useUserRead: () => ({
            user: ref(null),
            outcome: ref('idle'),
          }),
        }
      if (id.endsWith('/useUserView'))
        return { useUserView: () => ({ toView: () => null }) }
      return require(id)
    }
    compileFunction(code, ['require', 'module', 'exports'])(
      importModule,
      mod,
      mod.exports
    )
    return mod.exports.default
  }
  const footer = component('components/layouts/shared/SideBarFooter.vue')
  const app = workspace
    ? createSSRApp(component('workspace/components/Sidebar.vue'))
    : createSSRApp(footer, { collapsed })
  const links = (items) =>
    items.flat().map((item) => h('a', { href: item.to }, item.label))
  app.component('FireLayoutsSharedSideBarFooter', footer)
  app.component('UDashboardSidebar', {
    setup:
      (_, { slots }) =>
      () =>
        h('aside', [
          h('header', slots.header({ collapsed })),
          h('footer', slots.footer({ collapsed })),
        ]),
  })
  app.component('NuxtLink', {
    props: ['to'],
    setup:
      (p, { slots }) =>
      () =>
        h('a', { href: p.to }, slots.default?.()),
  })
  app.component('ClientOnly', { setup: (_, { slots }) => slots.default })
  const switcher = component('workspace/components/EntitySwitcher.vue')
  app.component('WorkspacePropertyNavigation', {
    props: ['collapsed'],
    setup: (p) => () =>
      h(switcher, {
        collapsed: p.collapsed,
        workspaceLabel: 'Property',
        to: '/workspace/property',
        pending: entityPending,
        item: entityItem,
      }),
  })
  app.component('UNavigationMenu', {
    props: ['items'],
    setup: (p) => () => h('nav', links(p.items)),
  })
  app.component('UButton', {
    props: {
      to: [String, Object],
      label: String,
      trailingIcon: String,
      square: Boolean,
      loading: Boolean,
      disabled: Boolean,
    },
    setup: (p, { attrs, slots }) => {
      buttons.push({ ...p, ariaLabel: attrs['aria-label'] })
      return () =>
        h(
          p.to ? 'a' : 'button',
          {
            href:
              typeof p.to === 'object'
                ? `${p.to.path}?${new URLSearchParams(p.to.query)}`
                : p.to,
            disabled: p.disabled || undefined,
          },
          [slots.leading?.(), p.label, slots.trailing?.()]
        )
    },
  })
  app.component('UDropdownMenu', {
    props: ['items'],
    setup: (p, { slots }) => {
      dropdowns.push(p.items)
      return () => h('div', [slots.default?.(), h('menu', links(p.items))])
    },
  })
  app.component('UAvatar', {
    props: ['src', 'alt'],
    setup: (p) => () => h('img', { src: p.src, alt: p.alt }),
  })
  for (const name of ['AppBrandWordmark', 'AppBrandLogo']) {
    app.component(name, { render: () => h('img', { src: name }) })
  }
  for (const name of ['USeparator', 'USkeleton', 'UTooltip']) {
    app.component(name, { render: () => null })
  }
  return renderToString(app)
}

test('Workspace choices share one identity trigger and the same Home and domain menu in either sidebar mode', async () => {
  for (const collapsed of [false, true]) {
    const calls = []
    const choice = { label: 'Lake house', onSelect: () => calls.push('lake') }
    const buttons = [],
      dropdowns = []
    const html = await renderSidebar({
      collapsed,
      buttons,
      dropdowns,
      entityItem: {
        label: 'Alpine house',
        avatar: { src: '/alpine.png' },
        choices: [choice],
      },
    })
    assert.equal(dropdowns.length, 1, 'the Entity has one native dropdown')
    const [home, ...choices] = dropdowns[0].flat()
    assert.deepEqual(home, {
      label: 'Property Workspace home',
      icon: 'i-lucide-house',
      to: '/workspace/property',
    })
    assert.deepEqual(choices, [choice])
    choices[0].onSelect()
    assert.deepEqual(
      calls,
      ['lake'],
      'the menu keeps the domain selection action'
    )
    const triggers = buttons.filter((button) =>
      button.ariaLabel?.includes('Alpine house')
    )
    assert.equal(
      triggers.length,
      1,
      'identity and change control are one trigger'
    )
    assert.equal(
      triggers[0].to,
      undefined,
      'the trigger opens the menu; Home is a menu action'
    )
    assert.equal(triggers[0].label, collapsed ? undefined : 'Alpine house')
    assert.equal(
      triggers[0].trailingIcon,
      collapsed ? undefined : 'i-lucide-chevrons-up-down'
    )
    assert.equal(Boolean(triggers[0].square), collapsed)
    assert.match(html, /src="\/alpine.png" alt="Alpine house"/)
  }
})

test('Workspace pending and no-choice states retain their loading and direct Home behavior', async () => {
  for (const collapsed of [false, true]) {
    for (const pending of [false, true]) {
      const buttons = [],
        dropdowns = []
      await renderSidebar({
        collapsed,
        buttons,
        dropdowns,
        entityPending: pending,
        entityItem: {
          label: 'Property Workspace',
          choices: pending ? [{ label: 'Retained choice' }] : [],
        },
      })
      assert.deepEqual(
        dropdowns,
        [],
        'loading and empty choices do not open a menu'
      )
      const control = buttons.find((button) =>
        button.ariaLabel?.includes('Property')
      )
      assert.ok(control)
      assert.equal(control.to, pending ? undefined : '/workspace/property')
      assert.equal(Boolean(control.disabled), pending)
      assert.equal(Boolean(control.loading), pending)
      assert.equal(control.trailingIcon, undefined)
      assert.equal(Boolean(control.square), collapsed)
      assert.equal(
        control.label,
        collapsed
          ? undefined
          : pending
            ? 'Loading Property'
            : 'Property Workspace'
      )
    }
  }
})

test('Workspace brand and account link to public App Home while the switcher opens Workspace Home', async () => {
  for (const collapsed of [false, true]) {
    for (const homePath of ['/home', '/']) {
      const html = await renderSidebar({
        phase: 'signed-in',
        user: { displayName: 'Operator' },
        collapsed,
        homePath,
      })
      const header = html.match(/<header>([\s\S]*?)<\/header>/)[1]
      const footer = html.match(/<footer>([\s\S]*?)<\/footer>/)[1]
      assert.ok(header.includes(`href="${homePath}"`), header)
      assert.match(header, /aria-label="Example home"/)
      assert.ok(
        header.includes(collapsed ? 'AppBrandLogo' : 'AppBrandWordmark'),
        header
      )
      const account = footer.match(
        /aria-label="Open user menu"[\s\S]*?<menu>(.*?)<\/menu>/
      )[1]
      assert.ok(
        account.includes(`href="${homePath}">Example home</a>`),
        account
      )
      assert.match(account, /href="\/dashboard\/user-profile"/)
      assert.equal(footer.split(`href="${homePath}"`).length - 1, 1, footer)
      assert.match(footer, /href="\/workspace\/property"/)
      assert.match(footer, /Lake house/)
    }
  }
})

test('Dashboard footer keeps its public Home link outside the account menu', async () => {
  const html = await renderSidebar({
    workspace: false,
    phase: 'signed-in',
    user: { displayName: 'Operator' },
    homePath: '/welcome',
  })
  const actions = html.match(/<nav[^>]*>(.*?)<\/nav>/)[1]
  assert.match(actions, /href="\/welcome">Example home<\/a>/)
  assert.doesNotMatch(html.match(/<menu>(.*?)<\/menu>/)[1], /Example home/)
})

test('settled signed-out and anonymous Workspace guests can sign in with exact destination', async () => {
  for (const user of [null, { isAnonymous: true }]) {
    const html = await renderSidebar({ user })
    assert.match(html, /aria-label="Sign in"/)
    assert.doesNotMatch(html, /aria-label="Open user menu"/)
    assert.doesNotMatch(
      html.match(/<footer>([\s\S]*?)<\/footer>/)[1],
      /href="\/home"/
    )
    assert.match(
      html,
      /redirect=%2Fworkspace%2Fproperty%3Ffrom%3Ddirectory%23details/
    )
  }
})
test('sidebar does not flash guest controls during Auth restoration or for an account', async () => {
  for (const state of [
    { phase: 'loading' },
    { mounted: false },
    {
      phase: 'signed-in',
      user: { isAnonymous: false, displayName: 'Operator' },
    },
  ]) {
    assert.doesNotMatch(await renderSidebar(state), /aria-label="Sign in"/)
  }
})

async function renderPolishComponent(
  file,
  { phase = 'guest', member = null } = {}
) {
  const path = new URL(`../../runtime/${file}`, import.meta.url)
  const { descriptor } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  const script = compileScript(descriptor, {
    id: 'workspace-polish',
    inlineTemplate: true,
  })
  const code = transpileModule(
    script.content.replaceAll('import.meta.dev', 'false'),
    { compilerOptions: { module: ModuleKind.CommonJS, target: 9 } }
  ).outputText
  const mod = { exports: {} }
  const vue = require('vue')
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => {
      if (id === '#imports')
        return {
          ...vue,
          onMounted: (callback) => callback(),
          useToast: () => ({ add() {} }),
          useRoute: () => ({
            fullPath: '/workspace/kitchen?from=directory#home',
          }),
        }
      if (id.endsWith('/useAuthPhase'))
        return {
          useAuthPhase: () => ({ isGuest: ref(phase === 'guest') }),
        }
      if (id.endsWith('/useAuth'))
        return {
          useAuth: () => ({
            hasAuthState: ref(phase !== 'loading'),
            currentUser: ref(
              phase === 'signed-in'
                ? { uid: 'actor', isAnonymous: false }
                : null
            ),
          }),
        }
      if (id.endsWith('/useAppSession'))
        return {
          useAppSession: () => ({
            uid: ref(phase === 'signed-in' ? 'actor' : ''),
            app: ref({ id: 'app' }),
            appUser: ref(member),
            pending: ref(phase === 'loading'),
            error: ref(null),
          }),
        }
      if (id.endsWith('/FireUXConfig'))
        return { useFireUXConfig: () => ({ appId: 'app' }) }
      if (id.endsWith('/utils/access'))
        return {
          resolveAppUserAccess: (value) => ({
            hasMembership: Boolean(value),
            hasAdminAuthority: false,
            subscription: value?.subscription ?? 'free',
          }),
        }
      if (id.endsWith('/useCommandScope'))
        return { useCommandScope: () => () => () => true }
      if (id.endsWith('/useAppUserSubscriptions'))
        return {
          useAppUserSubscriptions: () => ({
            subscription: ref({
              label: member ? 'Professional' : 'Free',
              color: 'neutral',
              icon: 'i-lucide-user',
            }),
            next: ref({ id: 'business' }),
            update() {},
          }),
        }
      if (id === './GettingStarted.vue')
        return {
          default: {
            props: ['title', 'description'],
            setup:
              (p, { slots }) =>
              () =>
                h('section', [p.title, p.description, slots.actions?.()]),
          },
        }
      return require(id)
    },
    mod,
    mod.exports
  )
  const app = createSSRApp(mod.exports.default, { alwaysVisible: true })
  app.component('UButton', {
    props: ['to', 'label', 'disabled'],
    setup: (p) => () =>
      h(
        'a',
        {
          href:
            typeof p.to === 'object'
              ? `${p.to.path}?${new URLSearchParams(p.to.query)}`
              : p.to,
          'aria-disabled': p.disabled,
        },
        p.label
      ),
  })
  return renderToString(app)
}

test('shared Home guest guidance retains the exact sign-in destination', async () => {
  const html = await renderPolishComponent(
    'workspace/components/GuestWelcome.vue'
  )
  assert.match(html, /Start with your account/)
  assert.match(
    html,
    /redirect=%2Fworkspace%2Fkitchen%3Ffrom%3Ddirectory%23home/
  )
})
test('shared Home guidance does not flash for loading or signed-in accounts', async () => {
  for (const phase of ['loading', 'signed-in'])
    assert.doesNotMatch(
      await renderPolishComponent('workspace/components/GuestWelcome.vue', {
        phase,
      }),
      /Start with your account/
    )
})
test('subscription chrome renders settled guest or membership pricing without an unavailable placeholder', async () => {
  const file = 'app/app-user/components/SubscriptionControl.vue'
  assert.match(await renderPolishComponent(file), /View pricing for Free/)
  assert.match(
    await renderPolishComponent(file, {
      phase: 'signed-in',
      member: { id: 'actor', role: 'user', subscription: 'pro' },
    }),
    /View pricing for Professional/
  )
  for (const phase of ['loading', 'signed-in'])
    assert.doesNotMatch(
      await renderPolishComponent(file, { phase }),
      /<a|Free|Subscription unavailable/
    )
})

test('manifest colours come from App config', () => {
  const result = manifest(
    {},
    undefined,
    {},
    { palette: { accent: '#123456', canvas: '#654321' } }
  )
  assert.equal(result.theme_color, '#123456')
  assert.equal(result.background_color, '#654321')
})
