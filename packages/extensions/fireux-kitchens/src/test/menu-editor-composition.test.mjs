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
        { props: ['editor', 'row', 'section'], render: compile(template) },
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
test('item row reuses shared terms or local price/options without acquiring data', async () => {
  for (const sellableId of ['', 'sellable']) {
    const calls = [],
      saved = Promise.resolve('saved')
    const row = {
      id: 'item',
      dishId: 'dish',
      label: 'Soup',
      item: { status: 'active' },
      dish: { description: 'Daily soup' },
      price: 12,
    }
    const editor = {
      kitchenId: 'k',
      menuId: 'm',
      sectionId: 's',
      menuSlug: 'food',
      canWrite: true,
      savingAvailability: '',
      adoptedIds: {},
      boundSellable: () => sellableId,
      formatItemPrice: () => 'CHF 12',
      validatePrice: () => ({ isValid: true }),
      validateDishName: () => ({ isValid: true }),
      setAvailability: (...args) => calls.push(args),
      saveItemPrice: (...args) => {
        calls.push(args)
        return saved
      },
      saveDishName() {},
      saveDishDescription() {},
      updatePriceOptionsFor: () => () => {},
      updateAddOnsFor: () => () => {},
    }
    const { seen, html } = await render('Items/Edit/Row.vue', { row, editor })
    assert.match(html, /Soup/)
    assert.equal(seen.UButton[0].to.query.section, 's')
    seen.USwitch[0]['onUpdate:modelValue'](false)
    assert.deepEqual(calls[0], [row, false])
    if (sellableId) {
      assert.equal(
        seen.WorkspaceKitchenMenusItemsSharedTerms[0]['sellable-id'],
        'sellable'
      )
      assert.equal(seen.WorkspaceKitchenMenusItemsOptions, undefined)
    } else {
      assert.equal(
        seen.WorkspaceKitchenMenusItemsAdoptSharedTerms[0]['section-id'],
        's'
      )
      assert.equal(
        seen.MoleculesFormsEditableSimpleField[0].update('14'),
        saved
      )
      assert.deepEqual(calls[1], [row, '14'])
      assert.ok(seen.WorkspaceKitchenMenusItemsOptions)
    }
  }
})
