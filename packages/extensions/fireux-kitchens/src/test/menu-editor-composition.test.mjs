import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compile, createSSRApp, h, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'

const base = new URL(
  '../runtime/kitchen/components/Workspace/Menus/',
  import.meta.url
)
async function render(relative, props) {
  const source = readFileSync(new URL(relative, base), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const seen = {}
  const warnings = []
  const app = createSSRApp({
    render: () =>
      h(
        {
          props: ['editor', 'row', 'section', 'actions'],
          render: compile(template),
        },
        props
      ),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'UFormField',
    'UInput',
    'UButton',
    'UBadge',
    'USwitch',
    'UDropdownMenu',
    'MoleculesFormsEditableSimpleField',
    'MoleculesDisclosurePanel',
    'WorkspaceKitchenMenusItemsSharedTerms',
    'WorkspaceKitchenMenusItemsAdoptSharedTerms',
    'WorkspaceKitchenMenusItemsOptions',
    'WorkspaceKitchenMenusSectionsDishes',
  ]) {
    app.component(name, {
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        ;(seen[name] ||= []).push(attrs)
        return () => h('div', slots.default?.())
      },
    })
  }
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return { html, seen }
}
test('section creation control edits the shared draft and calls its coordinator', async () => {
  let submitted = 0
  const editor = reactive({
    newSectionLabel: '',
    newSectionDescription: '',
    savingSection: false,
    canWrite: true,
    canCreateSection: true,
    addSection: () => submitted++,
  })
  const { seen } = await render('Sections/Create/Index.vue', { editor })
  seen.UInput[0]['onUpdate:modelValue']('Starters')
  seen.UInput[1]['onUpdate:modelValue']('Small plates')
  seen.UButton[0].onClick()
  assert.equal(editor.newSectionLabel, 'Starters')
  assert.equal(editor.newSectionDescription, 'Small plates')
  assert.equal(submitted, 1)
})
test('section row preserves scoped save promises, disabled state and record navigation', async () => {
  const calls = [],
    saved = Promise.resolve('saved')
  const section = {
    id: 'section one',
    label: 'Starters',
    description: 'Small plates',
  }
  const editor = {
    menuSlug: 'food menu',
    canWrite: false,
    sectionsPending: false,
    sectionsError: null,
    daily: false,
    displaySectionLabel: (s) => s.label,
    validateSectionLabel: () => ({ isValid: true }),
    saveSectionLabel: (...args) => {
      calls.push(args)
      return saved
    },
  }
  const { seen, html } = await render('Sections/Collection/Row.vue', {
    section,
    editor,
  })
  assert.match(html, /Small plates/)
  const field = seen.MoleculesFormsEditableSimpleField[0]
  assert.equal(field.disabled, true)
  assert.equal(field.update('Mains'), saved)
  assert.deepEqual(calls, [['section one', 'Mains']])
  assert.equal(
    seen.UButton[0].to,
    '/workspace/kitchen/menus/food%20menu/section%20one'
  )
})
test('Menu item row shows prices, a vertical actions menu and explicit placement removal', async () => {
  const calls = []
  const row = {
    id: 'item',
    dishId: 'dish',
    label: 'Soup',
    item: { status: 'active' },
    dish: { description: 'Daily soup' },
    price: 12,
    priceOptions: [],
  }
  const editor = {
    kitchenId: 'k',
    menuId: 'm',
    sectionId: 's',
    menuSlug: 'food',
    canWrite: true,
    formatPrice: () => '12.00',
    removing: '',
    removeFromMenu: (...args) => calls.push(args),
  }
  const { seen, html } = await render('Items/Edit/Row.vue', {
    row,
    editor,
    actions: [{ label: 'Edit dish', to: '/dish' }],
  })
  assert.match(html, /Soup/)
  assert.match(html, /12\.00/)
  assert.doesNotMatch(html, /CHF/)
  assert.equal(seen.UDropdownMenu[0].items[0].label, 'Edit dish')
  assert.equal(seen.UButton[0]['aria-label'], 'Actions for Soup')
  assert.equal(seen.UButton[0].icon, 'i-lucide-ellipsis-vertical')
  assert.equal(seen.UButton[1]['aria-label'], 'Remove Soup from this Menu')
  seen.UButton[1].onClick()
  assert.deepEqual(calls, [[row]])
  assert.equal(seen.USwitch, undefined)
  assert.doesNotMatch(html, /rounded-lg|On menu/)
  assert.equal(seen.MoleculesFormsEditableSimpleField, undefined)
  assert.equal(seen.WorkspaceKitchenMenusItemsSharedTerms, undefined)
  assert.equal(seen.WorkspaceKitchenMenusItemsOptions, undefined)
})
