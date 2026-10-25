import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const base = new URL(
  '../runtime/kitchen/components/FoodAndDrink/Menus/Process/',
  import.meta.url
)
function template(name) {
  const source = readFileSync(new URL(name + '.vue', base), 'utf8')
  return source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
}
test('Process composition forwards model selection, draft comparison and review blocking', async () => {
  const selected = [],
    seen = {},
    warnings = []
  const process = {
    menu: {},
    source: { id: 'upload' },
    processDescription: 'Process source',
    sourceDescription: 'Saved source',
    canProcess: true,
    pendingMode: 'strong',
    processSource: (mode) => selected.push(mode),
    statusMessage: 'Processing',
    displayError: '',
    hasDraft: true,
    showStats: true,
    stats: [{ label: 'Draft items', value: '1' }],
    fileResults: [{ id: 'file', file_name: 'menu.pdf', status: 'done' }],
    writeMessage: 'Draft saved',
    flags: [{ code: 'review', level: 'warning', message: 'Check price' }],
    currentSections: [{ label: 'Existing', items: [] }],
    draftSections: [{ label: 'Draft', items: [] }],
    result: {},
    activeKitchenAppId: 'a',
    kitchenId: 'k',
    menuId: 'm',
    authToken: 'token',
    canWrite: true,
  }
  const app = createSSRApp({
    setup: () => ({ process }),
    render: compile(template('Index')),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of ['Run', 'Report', 'Comparison'])
    app.component('KitchenFoodAndDrinkMenusProcess' + name, {
      props: ['process'],
      computed: {
        attentionFlags() {
          return this.process.flags.filter((flag) =>
            ['warning', 'error'].includes(flag.level)
          )
        },
      },
      render: compile(template(name)),
    })
  app.component('FireDisclosurePanel', {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.default?.()),
  })
  for (const name of [
    'KitchenFoodAndDrinkMenusProcessCost',
    'KitchenFoodAndDrinkMenusProcessSections',
    'KitchenFoodAndDrinkMenusProcessReview',
    'FireDiagnosticsDebugPanel',
    'UPageCard',
    'UBadge',
    'FireCopyError',
    'UAlert',
  ])
    app.component(name, {
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => {
        ;(seen[name] ||= []).push(attrs)
        return () => h('div', slots.default?.())
      },
    })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  assert.match(html, /Draft saved/)
  assert.match(html, /Check price/)
  assert.match(html, /menu.pdf/)
  seen.KitchenFoodAndDrinkMenusProcessCost[0].onSelect('strong')
  assert.deepEqual(selected, ['strong'])
  assert.equal(seen.KitchenFoodAndDrinkMenusProcessCost[0]['can-process'], true)
  assert.equal(
    seen.KitchenFoodAndDrinkMenusProcessSections[0].sections,
    process.currentSections
  )
  assert.equal(
    seen.KitchenFoodAndDrinkMenusProcessSections[1].sections,
    process.draftSections
  )
  assert.equal(seen.KitchenFoodAndDrinkMenusProcessReview[0].blocked, true)
  assert.equal(seen.KitchenFoodAndDrinkMenusProcessReview[0]['menu-id'], 'm')
  assert.equal(seen.KitchenFoodAndDrinkMenusProcessReview[0].flags, process.flags)
})
