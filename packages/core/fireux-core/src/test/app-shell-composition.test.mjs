import { parse, compileTemplate } from 'vue/compiler-sfc'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import * as vue from 'vue'
import { compile, createSSRApp, h, reactive, ref } from 'vue'
import { compileFunction } from 'node:vm'
import { transpileModule, ModuleKind } from 'typescript'
import ts from 'typescript'
import { renderToString } from 'vue/server-renderer'
import {
  menuRouteProjection,
  parseMenuRouteTarget,
} from '../../../../extensions/fireux-kitchens/src/runtime/menu/utils/navigation/route.ts'

const repo = fileURLToPath(new URL('../../../../../', import.meta.url))
const runtime = join(repo, 'packages/core/fireux-core/src/runtime')

test('maintained App roots share the stock lifecycle; only Go QR embeds its own outlet', () => {
  for (const group of readdirSync(join(repo, 'projects'), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory())) {
    for (const app of readdirSync(join(repo, 'projects', group.name), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory())) {
      const file = join(repo, 'projects', group.name, app.name, 'app/app.vue')
      if (!existsSync(file)) continue
      const source = readFileSync(file, 'utf8')
      assert.match(source, /<FireuxApp\b/, file)
      if (group.name === 'fireux' && app.name === 'go-qr')
        assert.match(source, /route\.path\.startsWith\('\/tools\/'\)/)
      else assert.doesNotMatch(source, /<(UApp|NuxtPage|Workspace)\b/, file)
    }
  }
})

test('the common App root owns one native outlet, initialization and shared head registration', () => {
  const base = readFileSync(
    join(runtime, 'app/components/FireuxApp.vue'),
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
  assert.equal((base.match(/<NuxtPage\b/g) || []).length, 1)
  assert.match(base, /<NuxtLayout>\s*<NuxtPage\s*\/>\s*<\/NuxtLayout>/)
  assert.doesNotMatch(base, /<slot|<UMain|LazyWorkspace/)
  assert.match(base, /<DevOnly>\s*<AppDevControls\s*\/>\s*<\/DevOnly>/)
  assert.match(base, /<AppInitializationGate/)
  assert.match(base, /useAppHead\(useAppManifest\(\)\)/)
  assert.match(gate, /useAppRead\(config\.appId\)/)
  assert.match(gate, /exists\.value === false/)
  assert.match(head, /resolveSeoRobots/)
  assert.match(head, /withBuildVersion/)
})

test('Workspace navigation preserves its frame while route and Entity changes dispose the keyed page scope', async () => {
  const route = reactive({ path: '/workspace/project/team', query: {} })
  const selectedId = ref('one'),
    layout = ref('workspace')
  const counts = {
    frames: 0,
    framesStopped: 0,
    boundaries: 0,
    boundariesStopped: 0,
    pages: 0,
    pagesStopped: 0,
    initialization: 0,
  }
  const element = (type, text = '') => ({
    type,
    text,
    children: [],
    parent: null,
  })
  const remove = (node) => {
    if (node.parent)
      node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  }
  const renderer = vue.createRenderer({
    createElement: element,
    createText: (text) => element('#text', text),
    createComment: (text) => element('#comment', text),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.children.forEach((child) => {
        child.parent = null
      })
      node.children = []
      node.text = text
    },
    patchProp() {},
    insert: (node, parent, anchor = null) => {
      if (node === anchor) return
      remove(node)
      node.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      parent.children.splice(
        index < 0 ? parent.children.length : index,
        0,
        node
      )
    },
    remove,
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
  })
  const wrapper = (tag) => ({
    setup:
      (_, { slots }) =>
      () =>
        h(tag, slots.default?.()),
  })
  const workspace = surface(join(runtime, 'layouts/workspace.vue'), {
    notificationsOpen: false,
  })
  const setupWorkspace = workspace.setup
  workspace.setup = () => {
    counts.frames++
    vue.onScopeDispose(() => counts.framesStopped++)
    return setupWorkspace()
  }
  const ordinary = surface(join(runtime, 'layouts/default.vue'))
  const app = renderer.createApp(
    surface(join(runtime, 'app/components/FireuxApp.vue'))
  )
  for (const name of ['UApp', 'UContainer', 'UDashboardGroup'])
    app.component(name, wrapper('div'))
  app.component('UMain', wrapper('main'))
  app.component('NuxtLayout', {
    setup:
      (_, { slots }) =>
      () =>
        h(layout.value === 'workspace' ? workspace : ordinary, null, {
          default: slots.default,
        }),
  })
  app.component(
    'WorkspacePage',
    surface(join(runtime, 'workspace/components/Page.vue'), {
      route,
      title: 'Team',
      description: '',
      contentHeader: false,
      workspace: 'project',
      selectedId,
    })
  )
  app.component('UDashboardPanel', {
    setup:
      (_, { slots }) =>
      () =>
        h('div', [slots.header?.(), slots.body?.()]),
  })
  app.component('NuxtErrorBoundary', {
    setup: (_, { slots }) => {
      counts.boundaries++
      vue.onScopeDispose(() => counts.boundariesStopped++)
      return () => slots.default?.()
    },
  })
  app.component('NuxtPage', {
    setup() {
      counts.pages++
      vue.onScopeDispose(() => counts.pagesStopped++)
      return () => h('article', route.path)
    },
  })
  app.component('AppInitializationGate', {
    setup() {
      counts.initialization++
      return () => null
    },
  })
  for (const name of [
    'WorkspaceSidebar',
    'WorkspaceNavbar',
    'WorkspaceBreadcrumbs',
    'WorkspacePageHeader',
    'FireLayoutsDefaultHeader',
    'FireLayoutsDefaultFooter',
    'FireLayoutsSharedRoleBadge',
    'FireLayoutsSharedNotificationsSlideover',
    'FirePwaStatus',
    'AppDevControls',
    'UAlert',
    'UButton',
    'ClientOnly',
    'DevOnly',
  ])
    app.component(name, { render: () => null })
  app.mount(element('root'))
  assert.deepEqual(counts, {
    frames: 1,
    framesStopped: 0,
    boundaries: 1,
    boundariesStopped: 0,
    pages: 1,
    pagesStopped: 0,
    initialization: 1,
  })
  route.query = { view: 'details' }
  await vue.nextTick()
  assert.equal(counts.boundaries, 1)
  selectedId.value = 'two'
  await vue.nextTick()
  assert.equal(counts.frames, 1)
  assert.equal(counts.boundariesStopped, 1)
  assert.equal(counts.pagesStopped, 1)
  route.path = '/workspace/project/identity'
  await vue.nextTick()
  assert.equal(counts.frames, 1)
  assert.equal(counts.boundaries, 3)
  assert.equal(counts.pagesStopped, 2)
  layout.value = 'default'
  await vue.nextTick()
  assert.equal(counts.framesStopped, 1)
  assert.equal(counts.boundariesStopped, 3)
  assert.equal(counts.initialization, 1)
  layout.value = 'workspace'
  await vue.nextTick()
  assert.equal(counts.frames, 2)
  assert.equal(counts.initialization, 1)
  app.unmount()
  assert.equal(counts.framesStopped, counts.frames)
  assert.equal(counts.boundariesStopped, counts.boundaries)
  assert.equal(counts.pagesStopped, counts.pages)
})

function surface(file, state = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  return { setup: () => state, render: compile(descriptor.template.content) }
}

for (const layout of [
  'default',
  'docs',
  'landing',
  'auth',
  'dashboard',
  'diagnostics',
  'workspace',
  'bare',
  'embedded',
]) {
  test(`${layout} consumes one supplied page in one main and initializes the App once`, async () => {
    let outlets = 0,
      initialization = 0
    const base = surface(join(runtime, 'app/components/FireuxApp.vue'))
    const app = createSSRApp(
      layout === 'embedded'
        ? surface(join(repo, 'projects/fireux/go-qr/app/app.vue'), {
            isToolRoute: true,
          })
        : base
    )
    const wrapper = (tag) => ({
      setup:
        (_, { slots }) =>
        () =>
          h(tag, slots.default?.()),
    })
    app.component('FireuxApp', base)
    for (const name of [
      'UApp',
      'UContainer',
      'UPage',
      'UDashboardGroup',
      'ClientOnly',
    ])
      app.component(name, wrapper('div'))
    app.component('UDashboardSidebar', {
      setup:
        (_, { slots }) =>
        () =>
          h('aside', [
            slots.header?.({ collapsed: false }),
            slots.default?.({ collapsed: false }),
            slots.footer?.({ collapsed: false }),
          ]),
    })
    app.component('UMain', wrapper('main'))
    app.component('UPageAside', wrapper('aside'))
    app.component('NuxtPage', {
      setup() {
        outlets++
        return () =>
          layout === 'bare'
            ? h('main', h('article', 'Route content'))
            : h('article', 'Route content')
      },
    })
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
              : join(
                  runtime,
                  `layouts/${layout === 'embedded' ? 'default' : layout}.vue`
                ),
            {
              navigation: [],
              topNav: [],
              middleNav: [],
              bottomNav: [],
              open: false,
              notificationsOpen: false,
              isNotificationsSlideoverOpen: false,
            }
          )
    )
    app.component('FireLayoutsDefaultHeader', wrapper('header'))
    app.component('FireLayoutsDefaultFooter', wrapper('footer'))
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
      'DevOnly',
      'AppInitializeSystem',
      'UModal',
      'UNavigationMenu',
      'USeparator',
      'UDashboardSidebarCollapse',
      'FireLayoutsDashboardProfileButton',
      'FireLayoutsSharedSideBarFooter',
      'FireLayoutsDiagnosticsNav',
      'FireLayoutsSharedFloatingChatButton',
      'FireLayoutsSharedRoleBadge',
      'FireLayoutsSharedNotificationsSlideover',
    ])
      app.component(name, { render: () => null })
    app.component('AppInitializationGate', {
      setup() {
        initialization++
        return () => null
      },
    })
    app.component('AppDevControls', {
      setup() {
        throw new Error('Production controls must not mount')
      },
    })
    const html = await renderToString(app)
    assert.equal(outlets, 1, html)
    assert.equal(initialization, layout === 'embedded' ? 0 : 1)
    assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, html)
    const content = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1]
    assert.match(content, /Route content/)
    assert.doesNotMatch(content, /<(?:header|footer)\b/)
  })
}

function maintainedRuntimeDirectories(name) {
  const result = []
  for (const lane of ['packages', 'projects'])
    for (const family of readdirSync(join(repo, lane), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory()))
      for (const owner of readdirSync(join(repo, lane, family.name), {
        withFileTypes: true,
      }).filter((entry) => entry.isDirectory())) {
        const directory = join(
          repo,
          lane,
          family.name,
          owner.name,
          lane === 'packages' ? 'src/runtime' : 'app',
          name
        )
        if (existsSync(directory)) result.push(directory)
      }
  return result
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesBelow(join(directory, entry.name))
      : [join(directory, entry.name)]
  )
}

test('every maintained native layout has one root and consumes the page slot inside its landmark owner', () => {
  for (const directory of maintainedRuntimeDirectories('layouts'))
    for (const file of readdirSync(directory)
      .filter((name) => name.endsWith('.vue'))
      .map((name) => join(directory, name))) {
      const { descriptor } = parse(readFileSync(file, 'utf8'))
      const template = descriptor.template.content
      assert.equal(
        descriptor.template.ast.children.filter((node) => node.type === 1)
          .length,
        1,
        file
      )
      assert.equal((template.match(/<slot\s*\/>/g) || []).length, 1, file)
      assert.doesNotMatch(template, /<NuxtPage\b/, file)
      if (file.endsWith('/layouts/workspace.vue')) {
        assert.match(
          template,
          /<WorkspacePage>\s*<slot\s*\/>\s*<\/WorkspacePage>/,
          file
        )
      } else
        assert.equal(
          (template.match(/<(?:UMain|main)\b/g) || []).length,
          1,
          file
        )
    }
})

test('maintained layout:false page content owns its main while the Go QR embed keeps its App landmark', () => {
  let inspected = 0
  for (const directory of maintainedRuntimeDirectories('pages'))
    for (const file of filesBelow(directory).filter((name) =>
      name.endsWith('.vue')
    )) {
      const { descriptor } = parse(readFileSync(file, 'utf8'))
      if (!descriptor.template) continue
      const source = ts.createSourceFile(
        file,
        descriptor.scriptSetup?.content || descriptor.script?.content || '',
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      )
      let bare = false,
        assignedLayout = false
      const visit = (node) => {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(source) === 'definePageMeta' &&
          ts.isObjectLiteralExpression(node.arguments[0])
        ) {
          bare = node.arguments[0].properties.some(
            (prop) =>
              prop.name?.getText(source) === 'layout' &&
              prop.initializer?.kind === ts.SyntaxKind.FalseKeyword
          )
          // This registered middleware selects a named layout for the required Menu id.
          // Its actual runtime branches and supplied slot are exercised below.
          assignedLayout = node.arguments[0].properties.some(
            (prop) =>
              prop.name?.getText(source) === 'middleware' &&
              ts.isArrayLiteralExpression(prop.initializer) &&
              prop.initializer.elements.some(
                (value) =>
                  ts.isStringLiteral(value) &&
                  value.text === 'menu-projection-layout'
              )
          )
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
      if (!bare) continue
      const count = (
        descriptor.template.content.match(/<(?:UMain|main)\b/g) || []
      ).length
      assert.equal(
        count,
        assignedLayout ||
          file.includes('/projects/fireux/go-qr/app/pages/tools/')
          ? 0
          : 1,
        file
      )
      inspected++
    }
  assert.ok(inspected > 0)
})

function routeMiddleware(file, imports = {}, dependencies = {}) {
  return loadScript(readFileSync(join(repo, file), 'utf8'), {
    '#imports': { defineNuxtRouteMiddleware: (handler) => handler, ...imports },
    ...dependencies,
  }).default
}

async function renderRuntimeLayout(layout, layoutFile, page, state = {}) {
  const app = createSSRApp(
    surface(join(runtime, 'app/components/FireuxApp.vue'))
  )
  const wrapper = (tag) => ({
    setup:
      (_, { slots }) =>
      () =>
        h(tag, slots.default?.()),
  })
  for (const name of [
    'UApp',
    'UContainer',
    'ULink',
    'UButton',
    'NuxtLink',
    'UIcon',
  ])
    app.component(name, wrapper('div'))
  app.component('UMain', wrapper('main'))
  app.component(
    'NuxtLayout',
    layout === false ? wrapper('div') : surface(layoutFile, state)
  )
  app.component('NuxtPage', page)
  app.component('MenuRouteSurface', {
    render: () => h('article', 'Menu content'),
  })
  for (const name of [
    'ClientOnly',
    'DevOnly',
    'FirePwaStatus',
    'AppInitializationGate',
    'MenuExit',
    'AppDevControls',
    'SproochliLanguageTrigger',
    'UAvatar',
    'USkeleton',
    'UTooltip',
    'FireLayoutsDefaultHeader',
    'FireLayoutsDefaultFooter',
  ])
    app.component(name, { render: () => null })
  return renderToString(app)
}

test('actual Menu middleware switches browse/order/diagnostic layouts without duplicating the page landmark', async () => {
  const middleware = routeMiddleware(
    'packages/extensions/fireux-kitchens/src/runtime/middleware/menu-projection-layout.ts',
    {},
    {
      '../menu/utils/navigation/route': {
        menuRouteProjection,
        parseMenuRouteTarget,
      },
    }
  )
  for (const routeFile of [
    'packages/extensions/fireux-kitchens/src/runtime/pages/menus/[menuId]/index.vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/menus/[menuId]/index.vue',
  ]) {
    const to = {
      params: { menuId: 'lunch' },
      meta: { layout: false, requiresAuth: false },
    }
    for (const [menuId, expected] of [
      ['lunch', 'menu'],
      ['lunch.collection', 'menu'],
      ['lunch.staff_pos', 'default'],
      ['lunch', 'menu'],
    ]) {
      to.params.menuId = menuId
      middleware(to)
      assert.equal(to.meta.layout, expected)
      assert.equal(to.meta.requiresAuth, false)
      const layoutFile =
        expected === 'menu'
          ? join(
              repo,
              'packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue'
            )
          : join(runtime, 'layouts/default.vue')
      const html = await renderRuntimeLayout(
        expected,
        layoutFile,
        surface(join(repo, routeFile), {
          menuRouteScope: { kind: 'root' },
          routeMenuId: 'lunch',
        }),
        {
          routeScope: { kind: 'root' },
          isKioskMenu: false,
          exitLabel: 'Back',
          exitKind: 'link',
          exitPath: '/',
        }
      )
      assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, html)
      assert.equal((html.match(/Menu content/g) || []).length, 1, html)
    }
  }
})

test('Jobs runtime selectors retain one named-layout landmark and preserve route authority', async () => {
  const jobs = routeMiddleware(
    'projects/misebox/interlaken-essen/app/middleware/interlaken-jobs.global.ts'
  )
  const misebox = routeMiddleware(
    'projects/misebox/misebox-app/app/middleware/misebox-jobs-surface.global.ts',
    {
      useRequestURL: () => new URL('https://jobs.misebox.app'),
      navigateTo: () => null,
    }
  )
  for (const [middleware, name, file] of [
    [
      jobs,
      'marketplace',
      'projects/misebox/interlaken-essen/app/layouts/marketplace.vue',
    ],
    [
      misebox,
      'misebox-jobs',
      'projects/misebox/misebox-app/app/layouts/misebox-jobs.vue',
    ],
  ]) {
    for (const path of ['/jobs', '/professionals', '/agents']) {
      const to = {
        path,
        meta: { layout: 'default', requiresAuth: true, roles: ['admin'] },
      }
      middleware(to)
      assert.equal(to.meta.layout, name)
      assert.equal(to.meta.requiresAuth, true)
      assert.deepEqual(to.meta.roles, ['admin'])
      const html = await renderRuntimeLayout(
        name,
        join(repo, file),
        { render: () => h('article', 'Jobs content') },
        { copy: (key) => key }
      )
      assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, html)
      assert.equal((html.match(/Jobs content/g) || []).length, 1, html)
    }
  }
  const publicPages = filesBelow(
    join(repo, 'packages/extensions/fireux-jobs/src/runtime/pages')
  ).filter(
    (file) =>
      /\/pages\/(jobs|professionals|agents)\//.test(file) &&
      file.endsWith('.vue')
  )
  assert.ok(publicPages.length > 0)
  for (const file of publicPages)
    assert.doesNotMatch(
      parse(readFileSync(file, 'utf8')).descriptor.template?.content || '',
      /<(?:UMain|main)\b/,
      file
    )
})

test('Sharer runtime layout opt-out remains an explicitly empty placeholder', async () => {
  // Supply the native auto-import while executing the actual App middleware.
  const middlewareSource = readFileSync(
    join(
      repo,
      'projects/sharer/sharer-app/app/middleware/shared-layout.global.ts'
    ),
    'utf8'
  )
  const middleware = compileFunction(
    middlewareSource.replace('export default ', 'return '),
    ['defineNuxtRouteMiddleware']
  )((handler) => handler)
  const file = join(
    repo,
    'projects/sharer/sharer-app/app/pages/shared/index.vue'
  )
  const template = parse(
    readFileSync(file, 'utf8')
  ).descriptor.template.content.trim()
  assert.equal(template, '<div />')
  const to = { path: '/shared', meta: {} }
  middleware(to)
  assert.equal(to.meta.layout, false)
  const html = await renderRuntimeLayout(false, '', surface(file))
  assert.doesNotMatch(html, /<main(?:\s|>)/)
})

test('reviewed shared foundation templates compile with their named slots', () => {
  for (const file of [
    'app/components/FireuxApp.vue',
    'layouts/workspace.vue',
    'workspace/components/Page.vue',
    'workspace/components/Breadcrumbs.vue',
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

test('actual App manifest follows native layout changes and declared Workspace availability without a rendering branch', () => {
  const route = reactive({ path: '/docs', meta: {} })
  const config = reactive({ workspaces: ['project'] })
  const routes = loadScript(
    readFileSync(join(runtime, 'workspace/utils/routes.ts'), 'utf8'),
    {}
  )
  const layouts = loadScript(
    readFileSync(join(runtime, 'app/utils/page-layout.ts'), 'utf8'),
    {}
  )
  const { useAppManifest } = loadScript(
    readFileSync(join(runtime, 'app/composables/useAppManifest.ts'), 'utf8'),
    {
      vue,
      '#imports': { useRoute: () => route },
      './config/FireUXConfig': { useFireUXConfig: () => config },
      '../utils/page-layout': layouts,
      '../../workspace/utils/routes': routes,
      '../../workspace/composables/useWorkspaceEntryCta': {
        useWorkspaceEntryCta: () => ({
          homePath: (family) => `/entry/${family}`,
        }),
      },
    }
  )
  const manifest = useAppManifest()
  assert.equal(manifest.value, '/manifest.webmanifest')
  route.path = '/workspace/project/identity'
  route.meta = { layout: 'workspace', workspace: 'project' }
  assert.equal(
    manifest.value,
    '/manifest.webmanifest?surface=workspace&start_url=%2Fentry%2Fproject'
  )
  route.meta.layout = { name: 'workspace', props: { compact: true } }
  assert.match(manifest.value, /surface=workspace/)
  route.meta.layout = false
  assert.equal(manifest.value, '/manifest.webmanifest')
  route.meta.layout = 'workspace'
  config.workspaces = []
  assert.equal(manifest.value, '/manifest.webmanifest')
  config.workspaces = ['kitchen']
  assert.equal(manifest.value, '/manifest.webmanifest')
  config.workspaces = ['project']
  route.path = '/docs/app'
  route.meta = { layout: 'docs' }
  assert.equal(manifest.value, '/manifest.webmanifest')
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
      '../utils/app-theme': { resolveAppTheme: (value) => value },
      '../../../utils/seo-indexing': {
        resolveSeoRobots: ({ path }) =>
          path.startsWith('/workspace') ? 'noindex' : 'index',
      },
      '../utils/build-version-url': {
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
    readFileSync(join(runtime, 'app/utils/app-theme.ts'), 'utf8'),
    { '../../../types/theme': types }
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
    const app = createSSRApp({
      render: () =>
        h(page, null, {
          default: () =>
            contentHeader
              ? h('header', [h('h1', 'Dynamic title'), 'Dynamic description'])
              : h('article', 'Page content'),
        }),
    })
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
