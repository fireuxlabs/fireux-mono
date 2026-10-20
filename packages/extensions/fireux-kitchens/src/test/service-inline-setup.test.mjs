import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import * as vue from 'vue'
import { parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import { offeringOverviewPolicy } from './offering-test-helpers.mjs'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/components/Workspace/Offerings/Service.vue',
    import.meta.url
  ),
  'utf8'
)
const template = parse(source).descriptor.template.content
async function render(option, enabled) {
  const editor = vue.reactive({
    enabled,
    busy: false,
    error: '',
    menuIds: ['food'],
    sameAsKitchen: false,
    hours: { windows: [{ days: ['tuesday'], open: '12:00', close: '20:00' }] },
    timezone: 'Europe/Zurich',
    interactions: option.types.map((type) => ({
      type,
      enabled: true,
      menu_ids: ['food'],
    })),
    setEnabled() {},
    setMenus() {},
    setHours() {},
    setSameAsKitchen() {},
    updateInteraction() {},
  })
  const setupState = {
    option,
    editor,
    disabled: false,
    menus: [],
    kitchenHours: undefined,
    workspace: { source: { menusOutcome: vue.ref('ready') } },
    kitchenOrderTypeLabel: (type) =>
      type === 'eat_in' ? 'Eat in' : 'Takeaway',
  }
  const app = vue.createSSRApp({
    setup: () => ({
      option,
      editor,
      disabled: false,
      readiness: { canEnable: true },
      section: null,
    }),
    render: vue.compile(template),
  })
  for (const [name, file] of [
    ['WorkspaceKitchenOfferingsSetup', 'Setup.vue'],
    ['WorkspaceKitchenOfferingsSetupKiosk', 'Setup/Kiosk.vue'],
    ['WorkspaceKitchenOfferingsSetupPreOrder', 'Setup/PreOrder.vue'],
  ]) {
    const child = parse(
      readFileSync(
        new URL(
          `../runtime/kitchen/components/Workspace/Offerings/${file}`,
          import.meta.url
        ),
        'utf8'
      )
    ).descriptor.template.content
    app.component(name, { setup: () => setupState, render: vue.compile(child) })
  }
  app.component('UIcon', { render: () => null })
  app.component('MoleculesCopyError', { render: () => null })
  app.component('USwitch', {
    props: ['modelValue'],
    setup: (props) => () =>
      vue.h('button', { role: 'switch', 'aria-checked': props.modelValue }),
  })
  for (const [name, label] of [
    ['WorkspaceKitchenOfferingsSetupMenus', 'Selected menus'],
    ['WorkspaceKitchenOfferingsSetupServiceHours', 'Serving hours'],
  ])
    app.component(name, { setup: () => () => vue.h('div', label) })
  const interaction = parse(
    readFileSync(
      new URL(
        '../runtime/kitchen/components/Workspace/Offerings/Setup/Interaction.vue',
        import.meta.url
      ),
      'utf8'
    )
  ).descriptor.template.content
  app.component('WorkspaceKitchenOfferingsSetupInteraction', {
    props: [
      'config',
      'label',
      'modeMenus',
      'menus',
      'menusOutcome',
      'disabled',
    ],
    setup: () => ({ update() {}, updateMenus() {} }),
    render: vue.compile(interaction),
  })
  app.component('WorkspaceKitchenOfferingsTiming', {
    props: ['config'],
    setup: (props) => () =>
      vue.h(
        'div',
        props.config.type === 'pre_order'
          ? 'Advance notice (hours)'
          : 'Preparation time (minutes)'
      ),
  })
  return renderToString(app)
}
test('all services show a switch, hide configuration while off and reveal it while on', async () => {
  for (const option of offeringOverviewPolicy.kitchenOfferingOptions) {
    const off = await render(option, false),
      on = await render(option, true)
    assert.match(off, /aria-checked="false"/, option.key)
    assert.doesNotMatch(off, /Selected menus|Serving hours/, option.key)
    assert.match(on, /aria-checked="true"/, option.key)
    assert.match(on, /Selected menus/, option.key)
    assert.match(on, /Serving hours/, option.key)
    assert.doesNotMatch(
      on,
      /Save|Discard|Configure|Temporarily paused|Customer message|Required contact|horizon|interval/,
      option.key
    )
    if (option.key === 'pre_order')
      assert.match(on, /Advance notice/, option.key)
    else assert.doesNotMatch(on, /Preparation time|Advance notice/, option.key)
  }
})
