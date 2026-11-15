import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { stripTypeScriptTypes } from 'node:module'
import { parse } from 'vue/compiler-sfc'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  reactive,
  ref,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'

const runtime = new URL('../../../../../runtime/', import.meta.url)
const source = readFileSync(
  new URL('kitchen/components/Workspace/AI/Focus.vue', runtime),
  'utf8'
)
const { descriptor } = parse(source)
function state(props, route) {
  const script = descriptor.scriptSetup.content.replace(/^import[^\n]+\n/gm, '')
  return new Function(
    'defineProps',
    'withDefaults',
    'ref',
    'watch',
    'useRoute',
    `${stripTypeScriptTypes(script)};return {contextOpen}`
  )(
    () => props,
    (p) => p,
    ref,
    watch,
    () => route
  )
}
async function render(overrides = {}, connectedContent) {
  const props = {
    focus: 'kitchen-ai.prep',
    label: 'Prep & Production',
    contextLabel: 'Prep',
    connected: false,
    spacious: false,
    ...overrides,
  }
  const scope = effectScope(),
    route = reactive({ fullPath: '/workspace/kitchen/prep' })
  const data = scope.run(() => state(props, route))
  const component = {
    props: Object.keys(props),
    setup: () => data,
    render: compile(descriptor.template.content),
  }
  const app = createSSRApp({
    render: () =>
      h(
        component,
        props,
        connectedContent ? { default: connectedContent } : {}
      ),
  })
  app.component('UIcon', { setup: () => () => h('span') })
  app.component('UBadge', {
    setup:
      (_, { slots }) =>
      () =>
        h('span', slots.default?.()),
  })
  app.component('UButton', {
    props: ['label'],
    setup:
      (p, { attrs }) =>
      () =>
        h('button', attrs, p.label),
  })
  app.component('UAlert', { setup: () => () => null })
  app.component('UModal', { setup: () => () => null })
  for (const name of ['WorkspaceAIComposer', 'WorkspaceAICompactComposer'])
    app.component(name, {
      props: {
        disabled: Boolean,
        canSubmit: Boolean,
        spacious: Boolean,
        ariaLabel: String,
      },
      setup: (p) => () =>
        h('form', [
          h('textarea', {
            disabled: p.disabled,
            'aria-label': p.ariaLabel,
            rows: p.spacious ? 3 : 1,
          }),
          h('button', { disabled: !p.canSubmit }, 'Send'),
        ]),
    })
  const html = await renderToString(app)
  scope.stop()
  return html
}
test('unconnected focuses show one clearly disabled composer and their operator label', async () => {
  const html = await render()
  assert.match(html, /data-kitchen-ai-focus="kitchen-ai.prep"/)
  assert.match(html, /Coming soon/)
  assert.match(html, /not connected yet/)
  assert.equal((html.match(/<textarea/g) || []).length, 1)
  assert.match(html, /textarea disabled/)
  assert.match(html, /rows="1"/)
  assert.match(html, /button disabled/)
  const group = await render({ spacious: true })
  assert.match(group, /rows="3"/)
})
test('connected focuses retain the domain-owned interaction instead of adding a placeholder composer', async () => {
  const html = await render({ connected: true }, () =>
    h('form', [
      h('textarea', { 'aria-label': 'Existing Menu prompt' }),
      h('button', 'Review action'),
    ])
  )
  assert.doesNotMatch(html, /Coming soon|not connected yet/)
  assert.equal((html.match(/<textarea/g) || []).length, 1)
  assert.match(html, /Existing Menu prompt/)
  assert.match(html, /Review action/)
})
test('the context disclosure closes when navigation changes its owner', () => {
  const props = reactive({ focus: 'kitchen-ai.prep', label: 'Prep' }),
    route = reactive({ fullPath: '/workspace/kitchen/prep' }),
    scope = effectScope()
  const data = scope.run(() => state(props, route))
  data.contextOpen.value = true
  route.fullPath = '/workspace/kitchen/menu'
  assert.equal(data.contextOpen.value, false)
  data.contextOpen.value = true
  props.focus = 'kitchen-ai.menu'
  assert.equal(data.contextOpen.value, false)
  scope.stop()
})
function vueFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((row) =>
    row.isDirectory()
      ? vueFiles(join(dir, row.name))
      : row.name.endsWith('.vue')
        ? [join(dir, row.name)]
        : []
  )
}
test('the agreed operator focus names are composed by Kitchen surfaces and routes', () => {
  const paths = [
    new URL('kitchen/components/', runtime),
    new URL('pages/workspace/kitchen/', runtime),
  ].flatMap((url) => vueFiles(fileURLToPath(url)))
  const sources = paths.map((path) => readFileSync(path, 'utf8')).join('\n')
  const focuses = new Set(
    [...sources.matchAll(/\bfocus="(kitchen-ai(?:\.[a-z-]+)*)"/g)].map(
      (row) => row[1]
    )
  )
  for (const focus of [
    'kitchen-ai',
    'overview',
    'identity',
    'identity.operating-hours',
    'identity.appearance',
    'team',
    'team.people',
    'menu',
    'menu.items',
    'menu.menus',
    'menu.promotions',
    'menu.services',
    'orders',
    'orders.board',
    'prep',
    'prep.ingredients',
    'prep.stations',
    'stock',
    'stock.inventory',
    'stock.purchasing',
    'stock.receiving',
    'stock.suppliers',
    'stock.waste',
    'food-safety',
    'food-safety.checks',
    'food-safety.records',
    'food-safety.actions',
    'food-safety.procedures',
    'reports',
    'reports.sales',
    'reports.service',
    'reports.food-costs',
    'reports.waste',
    'settings',
    'settings.payments',
    'settings.integrations',
    'settings.access',
    'calendar',
  ])
    assert.ok(
      focuses.has(focus === 'kitchen-ai' ? focus : `kitchen-ai.${focus}`),
      focus
    )
  for (const file of [
    'PrepAndProduction/Library.vue',
    'PrepAndProduction/Planning.vue',
  ])
    assert.match(
      readFileSync(new URL(`kitchen/components/${file}`, runtime), 'utf8'),
      /kitchen-ai\.prep\.\$\{view\}/
    )
})
