import { parse, compileTemplate, compileScript } from 'vue/compiler-sfc'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import * as vue from 'vue'
import { compile, createSSRApp, h, reactive, ref } from 'vue'
import { compileFunction } from 'node:vm'
import { transpileModule, ModuleKind } from 'typescript'
import { renderToString } from 'vue/server-renderer'

const repo = fileURLToPath(new URL('../../../../../', import.meta.url))
const runtime = join(repo, 'packages/core/fireux-core/src/runtime')

test('maintained App roots delegate stock lifecycle; only Go QR embeds its own outlet', () => {
  for (const group of readdirSync(join(repo, 'projects'), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory())) {
    for (const app of readdirSync(join(repo, 'projects', group.name), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory())) {
      const file = join(repo, 'projects', group.name, app.name, 'app/app.vue')
      if (!existsSync(file)) continue
      const source = readFileSync(file, 'utf8')
      const config = readFileSync(
        join(repo, 'projects', group.name, app.name, 'nuxt.config.ts'),
        'utf8'
      )
      const hasWorkspace = /workspaces\s*[:=]\s*\[\s*["']/.test(config)
      assert.match(
        source,
        hasWorkspace ? /<FireuxWorkspaceApp\b/ : /<FireuxApp\b/,
        file
      )
      if (group.name === 'fireux' && app.name === 'go-qr') {
        assert.match(source, /route\.path\.startsWith\('\/tools\/'\)/)
      } else assert.doesNotMatch(source, /<(UApp|NuxtPage|Workspace)\b/, file)
    }
  }
})

test('ordinary root owns bootstrap without Workspace imports; optional root composes it', () => {
  const base = readFileSync(
    join(runtime, 'app/components/FireuxApp.vue'),
    'utf8'
  )
  const workspace = readFileSync(
    join(runtime, 'app/components/FireuxWorkspaceApp.vue'),
    'utf8'
  )
  const gate = readFileSync(
    join(runtime, 'app/components/InitializationGate.vue'),
    'utf8'
  )
  const head = readFileSync(
    join(runtime, 'app/composables/useAppHead.ts'),
    'utf8'
  )
  assert.equal((base.match(/<UApp>/g) || []).length, 1)
  assert.match(base, /<slot>/)
  assert.match(base, /<NuxtPage/)
  assert.doesNotMatch(base + head, /Workspace|workspace\//)
  assert.match(base, /<DevOnly>\s*<AppDevControls\s*\/>\s*<\/DevOnly>/)
  assert.match(base, /<AppInitializationGate/)
  assert.match(gate, /useAppRead\(config\.appId\)/)
  assert.match(gate, /exists\.value === false/)
  assert.match(head, /resolveSeoRobots/)
  assert.match(head, /withBuildVersion/)
  assert.match(workspace, /<FireuxApp/)
  assert.doesNotMatch(workspace, /<UApp|useAppRead|useHead/)
})

function surface(file, state = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  return { setup: () => state, render: compile(descriptor.template.content) }
}

for (const layout of [
  'default',
  'docs',
  'bare',
  'workspace',
  'workspace-normal',
  'without-workspace',
  'embedded',
]) {
  test(`${layout} composition renders one main around page content`, async () => {
    const base = surface(join(runtime, 'app/components/FireuxApp.vue'))
    const shell = [
      'workspace',
      'workspace-normal',
      'without-workspace',
    ].includes(layout)
      ? surface(join(runtime, 'app/components/FireuxWorkspaceApp.vue'), {
          showWorkspace: layout === 'workspace',
          manifestPath: '/manifest.webmanifest',
        })
      : base
    const app = createSSRApp(
      layout === 'embedded'
        ? surface(join(repo, 'projects/fireux/go-qr/app/app.vue'), {
            isToolRoute: true,
          })
        : shell
    )
    const wrapper = (tag) => ({
      setup:
        (_, { slots }) =>
        () =>
          h(tag, slots.default?.()),
    })
    app.component('FireuxApp', base)
    app.component('UApp', wrapper('div'))
    app.component('UMain', wrapper('main'))
    app.component('UContainer', wrapper('div'))
    app.component('UPage', wrapper('div'))
    app.component('UPageAside', wrapper('aside'))
    app.component('NuxtPage', { render: () => h('article', 'Route content') })
    app.component(
      'NuxtLayout',
      layout === 'bare'
        ? wrapper('div')
        : surface(
            layout === 'docs'
              ? join(
                  repo,
                  'packages/extensions/fireux-docs/src/runtime/layouts/docs.vue'
                )
              : join(runtime, 'layouts/default.vue'),
            { navigation: [] }
          )
    )
    app.component('FireLayoutsDefaultHeader', wrapper('header'))
    app.component('FireLayoutsDefaultFooter', wrapper('footer'))
    app.component(
      'LazyWorkspace',
      surface(join(runtime, 'workspace/components/Index.vue'), {
        notificationsOpen: false,
      })
    )
    app.component(
      'WorkspacePage',
      surface(join(runtime, 'workspace/components/Page.vue'), {
        route: { path: '/workspace/example' },
        title: 'Workspace',
        description: '',
        contentHeader: false,
        workspace: 'example',
        selectedId: '',
      })
    )
    app.component('UDashboardGroup', wrapper('div'))
    app.component('UDashboardPanel', {
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.header?.(), slots.body?.()]),
    })
    app.component('WorkspaceSidebar', wrapper('nav'))
    app.component('WorkspaceNavbar', wrapper('header'))
    app.component('WorkspaceBreadcrumbs', wrapper('nav'))
    app.component('WorkspacePageHeader', wrapper('header'))
    app.component('NuxtErrorBoundary', wrapper('div'))
    for (const name of [
      'FirePwaStatus',
      'UButton',
      'UAlert',
      'AppInitializationGate',
      'ClientOnly',
      'DevOnly',
      'AppInitializeSystem',
      'UModal',
      'UNavigationMenu',
      'FireLayoutsSharedRoleBadge',
      'FireLayoutsSharedNotificationsSlideover',
    ])
      app.component(name, { render: () => null })
    app.component('AppDevControls', {
      setup() {
        throw new Error('Production controls must not mount')
      },
    })
    const html = await renderToString(app)
    assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, html)
    const content = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
    assert.match(content, /Route content/)
    assert.doesNotMatch(content, /<(?:header|footer)\b/)
  })
}

test('reviewed shared foundation templates compile with their named slots', () => {
  for (const file of [
    'app/components/FireuxApp.vue',
    'app/components/FireuxWorkspaceApp.vue',
    'app/components/InitializationGate.vue',
    'app/components/DevControls.vue',
    'components/layouts/default/Header.vue',
    'components/layouts/default/Footer.vue',
    'components/layouts/default/FooterAdmins.vue',
    'components/layouts/shared/PlatformFooter.vue',
    'components/molecules/DisclosurePanel.vue',
    'components/molecules/DisclosureCard.vue',
    'workspace/components/PageHeader.vue',
  ]) {
    const { descriptor } = parse(readFileSync(join(runtime, file), 'utf8'))
    assert.deepEqual(
      compileTemplate({
        source: descriptor.template.content,
        filename: file,
        id: 'foundation-check',
      }).errors,
      [],
      file
    )
  }
})

function loadScript(source, dependencies) {
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => {
      if (id in dependencies) return dependencies[id]
      throw new Error(`Unexpected dependency: ${id}`)
    },
    module,
    module.exports
  )
  return module.exports
}

test('actual Workspace root updates its branch and manifest through route changes', () => {
  const route = reactive({ path: '/docs', meta: {} })
  const config = reactive({ workspaces: ['project'] })
  const routes = loadScript(
    readFileSync(join(runtime, 'workspace/utils/routes.ts'), 'utf8'),
    {}
  )
  const { descriptor } = parse(
    readFileSync(join(runtime, 'app/components/FireuxWorkspaceApp.vue'), 'utf8')
  )
  const component = loadScript(
    compileScript(descriptor, { id: 'workspace-root' }).content,
    {
      vue,
      '#imports': { useRoute: () => route },
      '../composables/config/FireUXConfig': { useFireUXConfig: () => config },
      '../../workspace/utils/routes': routes,
      '../../workspace/composables/useWorkspaceEntryCta': {
        useWorkspaceEntryCta: () => ({
          homePath: (family) => `/workspace/${family}`,
        }),
      },
    }
  ).default
  const state = component.setup({}, { expose() {} })
  assert.equal(state.showWorkspace.value, false)
  assert.equal(state.manifestPath.value, '/manifest.webmanifest')
  route.path = '/workspace/project/identity'
  route.meta = { workspacePage: true, workspace: 'project' }
  assert.equal(state.showWorkspace.value, true)
  assert.equal(
    state.manifestPath.value,
    '/manifest.webmanifest?surface=workspace&start_url=%2Fworkspace%2Fproject'
  )
  config.workspaces = []
  assert.equal(state.showWorkspace.value, false)
  assert.equal(state.manifestPath.value, '/manifest.webmanifest')
  config.workspaces = ['project']
  route.path = '/docs/app'
  route.meta = {}
  assert.equal(state.showWorkspace.value, false)
  assert.equal(state.manifestPath.value, '/manifest.webmanifest')
})

test('actual App head retains one reactive registration across normal and Workspace navigation', () => {
  const route = reactive({ path: '/' })
  const manifest = ref('/manifest.webmanifest')
  const registrations = []
  const appConfig = reactive({ theme: { palette: { accent: '#123456' } } })
  const { useAppHead } = loadScript(
    readFileSync(join(runtime, 'app/composables/useAppHead.ts'), 'utf8'),
    {
      vue,
      '#imports': {
        useRoute: () => route,
        useAppConfig: () => appConfig,
        useRuntimeConfig: () => ({
          app: { buildId: 'test-build' },
          public: { fireux: { seo: {} } },
        }),
        useHead: (callback) => registrations.push(callback),
      },
      '../../utils/app-theme': { resolveAppTheme: (value) => value },
      '../../../utils/seo-indexing': {
        resolveSeoRobots: ({ path }) =>
          path.startsWith('/workspace') ? 'noindex' : 'index',
      },
      '../../utils/build-version-url': {
        withBuildVersion: (path, build) =>
          `${path}${path.includes('?') ? '&' : '?'}v=${build}`,
      },
    }
  )
  useAppHead(manifest)
  assert.equal(registrations.length, 1)
  assert.deepEqual(registrations[0]().meta, [
    { name: 'theme-color', content: '#123456' },
  ])
  assert.equal(
    registrations[0]().link[0].href,
    '/manifest.webmanifest?v=test-build'
  )
  route.path = '/workspace/project'
  manifest.value =
    '/manifest.webmanifest?surface=workspace&start_url=%2Fworkspace%2Fproject'
  assert.deepEqual(registrations[0]().meta, [
    { name: 'theme-color', content: '#123456' },
    { name: 'robots', content: 'noindex, nofollow' },
  ])
  assert.match(
    registrations[0]().link[0].href,
    /start_url=%2Fworkspace%2Fproject&v=test-build$/
  )
  route.path = '/docs'
  manifest.value = '/manifest.webmanifest'
  assert.deepEqual(registrations[0]().meta, [
    { name: 'theme-color', content: '#123456' },
  ])
  assert.equal(
    registrations[0]().link[0].href,
    '/manifest.webmanifest?v=test-build'
  )
  appConfig.theme.palette.accent = '#abcdef'
  assert.equal(registrations[0]().meta[0].content, '#abcdef')
  assert.equal(registrations.length, 1)
})

test('App theme validates the same complete palette and typography contract', () => {
  const types = loadScript(
    readFileSync(
      join(repo, 'packages/core/fireux-core/src/types/theme.ts'),
      'utf8'
    ),
    {}
  )
  const { resolveAppTheme } = loadScript(
    readFileSync(join(runtime, 'utils/app-theme.ts'), 'utf8'),
    { '../../types/theme': types }
  )
  const theme = {
    palette: Object.fromEntries(
      types.APP_PALETTE_KEYS.map((key) => [key, '#123456'])
    ),
  }
  assert.equal(resolveAppTheme(undefined), undefined)
  assert.equal(resolveAppTheme(theme), theme)
  assert.throws(() => resolveAppTheme(null), /must be an object/)
  assert.throws(
    () => resolveAppTheme({ palette: { accent: '#123456' } }),
    /exactly eight/
  )
  assert.throws(
    () => resolveAppTheme({ palette: { ...theme.palette, accent: 'red' } }),
    /exactly eight/
  )
  assert.throws(
    () =>
      resolveAppTheme({
        ...theme,
        typography: { display_family: '', body_family: 'Arial' },
      }),
    /typography/
  )
  assert.ok(
    resolveAppTheme({
      ...theme,
      typography: { display_family: 'Arial', body_family: 'Arial' },
    })
  )
})

for (const contentHeader of [false, true]) {
  test(`Workspace introduction has one owner with contentHeader=${contentHeader}`, async () => {
    const page = surface(join(runtime, 'workspace/components/Page.vue'), {
      route: { path: '/workspace/example' },
      title: 'Example',
      description: 'Static description',
      contentHeader,
      workspace: 'example',
      selectedId: '',
    })
    const app = createSSRApp(page)
    app.component('UDashboardPanel', {
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.header?.(), slots.body?.()]),
    })
    app.component('WorkspaceNavbar', { render: () => h('nav', 'Context') })
    app.component('WorkspaceBreadcrumbs', {
      render: () => h('nav', 'Breadcrumbs'),
    })
    app.component('WorkspacePageHeader', {
      props: ['description'],
      setup: (props) => () => h('header', props.description),
    })
    app.component('NuxtErrorBoundary', {
      setup:
        (_, { slots }) =>
        () =>
          slots.default?.(),
    })
    app.component('NuxtPage', {
      render: () =>
        contentHeader
          ? h('header', [h('h1', 'Dynamic title'), 'Dynamic description'])
          : h('article', 'Page content'),
    })
    app.component('UAlert', { render: () => null })
    app.component('UButton', { render: () => null })
    const html = await renderToString(app)
    assert.equal((html.match(/<header/g) || []).length, 1)
    assert.equal(html.includes('Static description'), !contentHeader)
    assert.equal(html.includes('Dynamic description'), contentHeader)
    assert.match(html, /Breadcrumbs/)
    assert.match(html, /Context/)
  })
}
