import { parse, compileTemplate } from 'vue/compiler-sfc'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { compile, createSSRApp, h } from 'vue'
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
      assert.match(source, /<AppShell\b/, file)
      if (group.name === 'fireux' && app.name === 'go-qr') {
        assert.match(source, /route\.path\.startsWith\('\/tools\/'\)/)
      } else assert.doesNotMatch(source, /<(UApp|NuxtPage|Workspace)\b/, file)
    }
  }
})

test('AppShell keeps route and initialization ownership apart from developer controls', () => {
  const shell = readFileSync(join(runtime, 'app/components/Shell.vue'), 'utf8')
  const controls = readFileSync(
    join(runtime, 'app/components/DevControls.vue'),
    'utf8'
  )
  assert.equal((shell.match(/<UApp>/g) || []).length, 1)
  assert.equal((shell.match(/<NuxtPage\b/g) || []).length, 1)
  assert.match(shell, /<Workspace v-if="route\.meta\.workspacePage"/)
  assert.match(shell, /useAppRead\(fireuxConfig\.appId\)/)
  assert.match(shell, /appExists\.value === false/)
  assert.match(shell, /resolveSeoRobots/)
  assert.match(shell, /withBuildVersion/)
  assert.match(shell, /<AppDevControls\s*\/>/)
  assert.match(shell, /<DevOnly>\s*<AppDevControls\s*\/>\s*<\/DevOnly>/)
  assert.doesNotMatch(controls, /useAppRead|useAppInitialization|<NuxtPage/)
  assert.match(controls, /onBeforeUnmount/)
})

function surface(file, state = {}) {
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  return { setup: () => state, render: compile(descriptor.template.content) }
}

for (const layout of ['default', 'docs', 'bare', 'workspace', 'embedded']) {
  test(`${layout} composition renders one main around page content`, async () => {
    const shell = surface(join(runtime, 'app/components/Shell.vue'), {
      route: { meta: { workspacePage: layout === 'workspace' } },
      showOnboardingModal: false,
    })
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
      'Workspace',
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
    app.component('NuxtErrorBoundary', wrapper('div'))
    for (const name of [
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
    'app/components/Shell.vue',
    'app/components/DevControls.vue',
    'components/layouts/default/Header.vue',
    'components/layouts/default/Footer.vue',
    'components/layouts/default/FooterAdmins.vue',
    'components/layouts/shared/PlatformFooter.vue',
    'components/molecules/DisclosurePanel.vue',
    'components/molecules/DisclosureCard.vue',
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
