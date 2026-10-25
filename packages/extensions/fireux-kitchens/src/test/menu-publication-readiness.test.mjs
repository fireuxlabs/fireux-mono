import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, reactive, ref, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const path =
  '../runtime/kitchen/components/FoodAndDrink/Menus/Publication/Readiness.vue'
const component = readFileSync(new URL(path, import.meta.url), 'utf8')
function readiness(props = {}) {
  const source = component
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const sections = ref([{ id: 's', label: 'Pizzas' }])
  const menu = ref({ status: 'published' })
  const collection = () => ({
    items: ref([]),
    pending: ref(false),
    error: ref(null),
  })
  const dishes = collection(),
    promotions = collection()
  const context = {
    menu,
    sections,
    sectionsPending: ref(false),
    sectionsError: ref(null),
    currencyCode: ref('CHF'),
  }
  const deps = {
    computed,
    reactive,
    defineProps: () => props,
    useKitchenMenuRecordContext: () => context,
    useKitchenChildCollection: (name) =>
      name === 'dishes' ? dishes : promotions,
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)};return {props,menu,sections,dishes,promotions,currencyCode,pending,error,empty,reports}`,
    Object.keys(deps)
  )(...Object.values(deps))
  return { api, context, dishes }
}
async function render(api) {
  const template = component.slice(
    component.indexOf('<template>') + 10,
    component.lastIndexOf('</template>')
  )
  const app = createSSRApp({ setup: () => api, render: compile(template) })
  app.component('KitchenFoodAndDrinkMenusPublicationReadinessSection', {
    render: () => null,
  })
  app.component('FireCopyError', {
    props: ['message'],
    setup: (props) => () => h('p', props.message),
  })
  app.component('UAlert', {
    props: ['title', 'description'],
    setup: (props) => () =>
      h('div', [h('h2', props.title), h('p', props.description)]),
  })
  return renderToString(app)
}
test('published Menu becomes visibly empty when its last displayable entry disappears', async () => {
  const { api } = readiness()
  assert.equal(api.pending.value, true)
  assert.ok((await render(api)).includes('Checking Menu content'))
  api.reports.set('s', {
    pending: false,
    error: null,
    result: { availableCount: 1, issues: [] },
  })
  assert.equal(api.empty.value, false)
  api.reports.set('s', {
    pending: false,
    error: null,
    result: { availableCount: 0, issues: [] },
  })
  assert.equal(api.empty.value, true)
  const html = await render(api)
  assert.ok(html.includes('This published Menu has no available items'), html)
  assert.ok(html.includes('or unpublish this Menu'), html)
  assert.equal(
    api.menu.value.status,
    'published',
    'warning must not auto-unpublish'
  )
  api.reports.set('s', {
    pending: false,
    error: null,
    result: { availableCount: 1, issues: [] },
  })
  assert.ok(
    !(await render(api)).includes('This published Menu has no available items')
  )
})
test('readiness never mistakes pending, failed, or removed section results for empty content', async () => {
  const { api, dishes } = readiness()
  api.reports.set('s', {
    pending: false,
    error: null,
    result: { availableCount: 0, issues: [] },
  })
  dishes.pending.value = true
  assert.equal(api.empty.value, false)
  dishes.pending.value = false
  dishes.error.value = Error('Catalogue unavailable')
  assert.equal(api.empty.value, false)
  assert.ok((await render(api)).includes('Catalogue unavailable'))
  dishes.error.value = null
  api.sections.value = []
  api.reports.set('s', {
    pending: false,
    error: null,
    result: { availableCount: 99, issues: [] },
  })
  assert.equal(
    api.empty.value,
    true,
    'removed section reports cannot make the Menu ready'
  )
  api.menu.value.status = 'draft'
  assert.ok(
    (await render(api)).includes('Add available items before publishing')
  )
})

test('section editing reuses its existing catalogue and promotion readers', () => {
  const dishSource = { pending: ref(false), error: ref(null) }
  const sectionContext = {
    dishes: ref([{ id: 'dish', name: 'Pizza', price: 13 }]),
    dishSource,
    promotions: { items: ref([]), pending: ref(false), error: ref(null) },
  }
  const { api } = readiness({ sectionContext })
  assert.equal(api.dishes.pending, dishSource.pending)
  assert.equal(api.promotions.pending, sectionContext.promotions.pending)
  assert.equal(api.dishes.items.value[0].name, 'Pizza')
})
