import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compile, computed, createSSRApp, h, reactive } from 'vue'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { renderToString } from 'vue/server-renderer'

const base = new URL(
  '../runtime/kitchen/components/Menu/Menus/',
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
          props: [
            'editor',
            'row',
            'section',
            'actions',
            'saveLabel',
            'itemDestination',
            'expanded',
            'emit',
          ],
          render: compile(template),
        },
        props
      ),
  })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'NuxtLink',
    'UFormField',
    'UInput',
    'UButton',
    'UBadge',
    'USwitch',
    'UDropdownMenu',
    'FireFormsEditableSimpleField',
    'FireDisclosurePanel',
    'KitchenMenuMenusItemsSharedTerms',
    'KitchenMenuMenusItemsAdoptSharedTerms',
    'KitchenMenuMenusItemsOptions',
    'KitchenMenuMenusSectionsItems',
  ]) {
    app.component(name, {
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        ;(seen[name] ||= []).push(attrs)
        return () => h('div', slots.default?.())
      },
    })
  }
  const rowSource = readFileSync(
    new URL(
      '../../../../core/fireux-core/src/runtime/components/Collection/Row.vue',
      import.meta.url
    ),
    'utf8'
  )
  const rowTemplate = rowSource.slice(
    rowSource.indexOf('<template>') + 10,
    rowSource.lastIndexOf('</template>')
  )
  app.component('FireCollectionRow', {
    props: { as: { default: 'article' } },
    render: compile(rowTemplate),
  })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return { html, seen }
}
function rowSetup(path, props, result) {
  const script = readFileSync(new URL(path, base), 'utf8')
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  return compileFunction(`${stripTypeScriptTypes(script)};return ${result}`, [
    'computed',
    'defineProps',
    'defineEmits',
  ])(
    computed,
    () => props,
    () => () => {}
  )
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
    captureScope: () => () => true,
    saveSectionLabel: (...args) => {
      calls.push(args)
      return saved
    },
  }
  const path = 'Sections/Collection/Row.vue'
  const props = { section, editor }
  const { seen, html } = await render(path, {
    ...props,
    expanded: false,
    emit: () => {},
    saveLabel: rowSetup(path, props, 'saveLabel'),
  })
  assert.match(html, /Small plates/)
  const field = seen.FireFormsEditableSimpleField[0]
  assert.equal(field.disabled, true)
  const fieldCurrent = () => false
  assert.equal(field['capture-intent'], editor.captureScope)
  assert.equal(field.update('Mains', fieldCurrent), saved)
  assert.deepEqual(calls, [['section one', 'Mains', fieldCurrent]])
  assert.equal(seen.UButton[0]['aria-expanded'], false)
  assert.equal(typeof seen.UButton[0].onClick, 'function')
  assert.equal(seen.UButton[0].to, undefined)
})
test('Menu item row shows prices and confirmed removal inside its vertical actions menu', async () => {
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
    canMove: () => true,
    move: () => {},
    removeFromMenu: (...args) => calls.push(args),
  }
  const actions = rowSetup(
    'Items/Edit/Row.vue',
    { row, editor },
    '({ actions: actions.value, itemDestination: itemDestination.value })'
  )
  const { seen, html } = await render('Items/Edit/Row.vue', {
    row,
    editor,
    ...actions,
  })
  assert.deepEqual(seen.NuxtLink[0].to, {
    path: '/workspace/kitchen/menu/items/dish',
    query: { menu: 'food', section: 's' },
  })
  assert.match(html, /Soup/)
  assert.match(html, /12\.00/)
  assert.doesNotMatch(html, /CHF/)
  assert.ok(
    seen.UDropdownMenu[0].items
      .flat()
      .some((action) => action.label === 'Edit item')
  )
  assert.equal(seen.UButton[0]['aria-label'], 'Actions for Soup')
  assert.equal(seen.UButton[0].icon, 'i-lucide-ellipsis-vertical')
  assert.equal(seen.UButton.length, 1)
  seen.UDropdownMenu[0].items
    .flat()
    .find((action) => action.label === 'Remove from this section')
    .onSelect()
  assert.deepEqual(calls, [[row]])
  assert.equal(seen.USwitch, undefined)
  assert.doesNotMatch(html, /rounded-lg|On menu/)
  assert.equal(seen.FireFormsEditableSimpleField, undefined)
  assert.equal(seen.KitchenMenuMenusItemsSharedTerms, undefined)
  assert.equal(seen.KitchenMenuMenusItemsOptions, undefined)
  editor.embedded = true
  const inline = rowSetup(
    'Items/Edit/Row.vue',
    { row, editor },
    '({ destination: itemDestination.value, actions: actions.value })'
  )
  assert.deepEqual(inline.destination.query, {
    menu: 'food',
    section: 's',
    inline: '1',
  })
  assert.deepEqual(
    inline.actions.flat().find((action) => action.label === 'Edit item').to,
    inline.destination
  )
})

test('inline section editor supplies the existing Menu record and explicit section scope once', () => {
  const props = { sectionId: 'las-tapas' },
    record = { id: 'existing-record' },
    calls = []
  const script = readFileSync(new URL('Sections/Inline.vue', base), 'utf8')
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  compileFunction(stripTypeScriptTypes(script), [
    'defineProps',
    'useKitchenMenuRecordContext',
    'provideMenuSection',
  ])(
    () => props,
    () => record,
    (owner, section) => calls.push({ owner, section })
  )
  assert.equal(calls.length, 1)
  assert.equal(calls[0].owner, record)
  assert.equal(calls[0].section(), 'las-tapas')
  props.sectionId = 'dessert'
  assert.equal(calls[0].section(), 'dessert')
})
