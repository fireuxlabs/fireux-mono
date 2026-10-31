import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { dishPricingHelpers } from './helpers/dish-pricing.mjs'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `;return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const pricing = load(
  'kitchen/utils/promotions/pricing.ts',
  'normalizeKitchenPromotion'
)
const meal = () => ({
  name: 'Pizza meal',
  status: 'active',
  currency: 'CHF',
  days: ['friday'],
  price: 15,
  groups: [
    {
      id: 'pizza',
      name: 'Pizza',
      choose: 1,
      dishes: [
        { dishId: 'd', supplement: 0 },
        { dishId: 'swiss', supplement: 3 },
      ],
    },
  ],
})
function fixture() {
  const records = new Map([
    [
      'kitchens/k/dishes/d',
      { name: 'Margherita', price: 13, price_options: [], add_ons: [] },
    ],
    [
      'kitchens/k/dishes/swiss',
      { name: 'Swiss', price: 20, price_options: [], add_ons: [] },
    ],
    ['kitchens/k/promotions/meal', meal()],
    ['kitchens/k/menus/m/sections/s', { label: 'Food' }],
    [
      'kitchens/k/menus/m/sections/s/items/dish',
      { dish_id: 'd', sort_order: 0 },
    ],
    [
      'kitchens/k/menus/m/sections/s/items/deal',
      { promotion_id: 'meal', sort_order: 1 },
    ],
  ])
  const reads = []
  const doc = (path) => ({
    id: path.split('/').at(-1),
    data: () => records.get(path),
  })
  const db = {
    collection: (path) => ({
      get: async () => {
        reads.push(path)
        return {
          docs: [...records.keys()]
            .filter(
              (key) =>
                key.startsWith(path + '/') &&
                !key.slice(path.length + 1).includes('/')
            )
            .map(doc),
        }
      },
      doc: (id) => ({
        get: async () => {
          reads.push(`${path}/${id}`)
          return doc(`${path}/${id}`)
        },
      }),
    }),
  }
  const { readKitchenMenuSections } = load(
    'menu/server/manifest/sections.ts',
    'readKitchenMenuSections',
    {
      ...dishPricingHelpers,
      ...pricing,
      serverKitchenDishesTarget: () => '',
      serverKitchenMenuSectionsTarget: () => '',
      serverKitchenMenuItemsTarget: () => '',
      kitchenPromotionsTarget: () => '',
      readDishItemKind: (x) => x,
      readRecord: (x) => x,
      readRecordString: (r, k) => String(r[k] || ''),
    }
  )
  return {
    records,
    reads,
    read: () =>
      readKitchenMenuSections(db, {
        appId: 'app',
        kitchenId: 'k',
        menuId: 'm',
        currencyCode: 'CHF',
      }),
  }
}
test('public Menu joins meal-deal choices from Kitchen Dishes and preserves normal prices', async () => {
  const f = fixture(),
    before = structuredClone(f.records)
  const sections = await f.read()
  assert.equal(sections[0].items[0].price, 13)
  const deal = sections[0].items[1]
  assert.equal(deal.price, 15)
  assert.deepEqual(deal.mealDeal.groups[0].dishes, [
    { dishId: 'd', name: 'Margherita', supplement: 0 },
    { dishId: 'swiss', name: 'Swiss', supplement: 3 },
  ])
  assert.deepEqual(f.records, before)
  assert.ok(f.reads.every((path) => !path.includes('order')))
  const { readMenuManifestSections } = load(
    'menu/server/payload/sections.ts',
    'readMenuManifestSections',
    { readDishItemKind: (x) => x }
  )
  assert.deepEqual(
    readMenuManifestSections(sections)[0].items[1].mealDeal,
    deal.mealDeal
  )
})
test('paused or removed deals disappear; malformed placements and currency fail closed', async () => {
  for (const state of ['paused', 'removed']) {
    const f = fixture()
    if (state === 'paused')
      f.records.get('kitchens/k/promotions/meal').status = 'paused'
    else f.records.delete('kitchens/k/promotions/meal')
    assert.equal((await f.read())[0].items.length, 1)
  }
  for (const cause of ['currency', 'mixed']) {
    const f = fixture()
    if (cause === 'currency')
      f.records.get('kitchens/k/promotions/meal').currency = 'EUR'
    if (cause === 'mixed')
      f.records.get('kitchens/k/menus/m/sections/s/items/deal').dish_id = 'd'
    await assert.rejects(f.read())
  }
})
test('public meal-deal presentation shows choose counts, included choices and supplements without ordering controls', async () => {
  const f = fixture(),
    deal = (await f.read())[0].items[1].mealDeal
  const source = readFileSync(
    new URL('menu/components/Detail/MealDeal.vue', runtime),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const component = {
    props: ['deal', 'formatPrice'],
    render: compile(template),
  }
  const html = await renderToString(
    createSSRApp({
      render: () => h(component, { deal, formatPrice: (n) => `CHF ${n}` }),
    })
  )
  assert.match(html, /Choose 1/)
  assert.match(html, /Margherita/)
  assert.match(html, /Included/)
  assert.match(html, /\+ CHF 3/)
  assert.doesNotMatch(html, /<button|<input|<select|CHF 13|CHF 20/)
})

test('section parent provides one state to all editing controls without injecting its own Menu provider', async () => {
  const { computed, inject, provide, ref } = await import('vue')
  let acquisitions = 0
  const menuState = {
    sections: ref([]),
    allSections: ref([{ id: 's', status: 'archived' }]),
    storageKitchenId: ref('k'),
    menu: ref({ id: 'm' }),
    menuId: ref('m'),
    rootCollection: ref('kitchens'),
    databaseId: ref('misebox'),
    canWrite: ref(true),
    debug: ref({}),
  }
  const state = load(
    'menu/composables/useMenuSection.ts',
    'provideMenuSection,useMenuSection',
    {
      computed,
      toValue: (x) =>
        x && typeof x === 'object' && 'value' in x ? x.value : x,
      inject,
      provide,
      useKitchenMenuRecordContext: () => {
        throw new Error('Parent must pass its own Menu state')
      },
      useKitchenDishCollection: () => ({
        dishes: ref([]),
        pending: ref(false),
        error: ref(null),
      }),
      useKitchenChildCollection: () => {
        acquisitions++
        return { items: ref([]), pending: ref(false), error: ref(null) }
      },
      useRouteParam: () => ref('s'),
      useMenuSectionItemCollection: () => ({
        items: ref([]),
        pending: ref(false),
      }),
      useMenuItemMutations: () => ({}),
      useDishUpdate: () => ({}),
      ...dishPricingHelpers,
    }
  )
  let parent
  const child = {
    setup() {
      assert.equal(state.useMenuSection(), parent)
      return () => h('span', 'control')
    },
  }
  const app = createSSRApp({
    setup() {
      parent = state.provideMenuSection(menuState, ref('s'))
      assert.equal(parent.section.value.status, 'archived')
      return () => h('div', [h(child), h(child), h(child)])
    },
  })
  await renderToString(app)
  assert.equal(acquisitions, 1)
  parent.canWrite.value = false
  await assert.rejects(
    parent.removeItem('k', 'm', 's', 'item', () => true),
    /read-only/
  )
})

test('meal-deal group and Dish copy use existing translation fields without translating prices', async () => {
  const { menuFields, translatedMenu } = load(
    'menu/server/sproochli/resolve.ts',
    'menuFields,translatedMenu'
  )
  const deal = (await fixture().read())[0].items[1]
  const item = {
    id: 'deal',
    name: deal.name,
    description: '',
    price: 15,
    priceOptions: [],
    addOns: [],
    mealDeal: deal.mealDeal,
  }
  const manifest = {
    content: {
      id: 'm',
      name: 'Food',
      description: '',
      sections: [{ id: 's', label: 'Meals', items: [item] }],
    },
  }
  const fields = menuFields(manifest)
  const field = fields.find((field) => field.sourceText === 'Margherita')
  assert.ok(field)
  const result = translatedMenu(
    manifest,
    new Map([[field.id, 'Translated Margherita']])
  )
  const translated = result.content.sections[0].items[0]
  assert.equal(
    translated.mealDeal.groups[0].dishes[0].name,
    'Translated Margherita'
  )
  assert.equal(translated.mealDeal.groups[0].dishes[1].supplement, 3)
  assert.equal(translated.price, 15)
  assert.equal(item.mealDeal.groups[0].dishes[0].name, 'Margherita')
})

test('section Add meal deal dispatches only a scoped reference and ignores obsolete completion', async () => {
  const { ref, computed, watch, effectScope } = await import('vue')
  const owner = effectScope()
  let current = true,
    finish
  const calls = [],
    notices = []
  const context = {
    kitchenId: ref('k'),
    menuId: ref('m'),
    sectionId: ref('s'),
    section: ref({ id: 's' }),
    menu: ref({ schedule: 'regular' }),
    promotions: { items: ref([{ id: 'meal', ...meal() }]) },
    itemRows: ref([]),
    canWrite: ref(true),
    createItem: (input) => {
      calls.push(input)
      return new Promise((resolve) => {
        finish = resolve
      })
    },
  }
  const source = readFileSync(
    new URL(
      'kitchen/components/FoodAndDrink/Menus/Items/Add/MealDeal.vue',
      runtime
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const dependencies = {
    ref,
    computed,
    watch,
    useMenuSection: () => context,
    useMenuEditorScope: () => () => () => current,
    useToastify: () => ({ add: (notice) => notices.push(notice) }),
  }
  const api = owner.run(() =>
    compileFunction(
      stripTypeScriptTypes(source) + ';return {add,promotionId,saving}',
      Object.keys(dependencies)
    )(...Object.values(dependencies))
  )
  api.promotionId.value = 'meal'
  context.canWrite.value = false
  await api.add()
  assert.equal(calls.length, 0)
  context.canWrite.value = true
  const pending = api.add()
  assert.deepEqual(calls, [
    {
      kitchenId: 'k',
      menuId: 'm',
      sectionId: 's',
      promotionId: 'meal',
    },
  ])
  current = false
  finish()
  await pending
  assert.equal(notices.length, 0)
  owner.stop()
})

test('ordering Menu presentation keeps meal deals read-only while retaining normal Dish buttons', async () => {
  const source = readFileSync(
    new URL('menu/components/Order/MenuItems.vue', runtime),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const deal = (await fixture().read())[0].items[1].mealDeal
  const sections = [
    {
      id: 's',
      label: 'Food',
      items: [
        { id: 'dish', name: 'Margherita', price: 13, priceOptions: [] },
        {
          id: 'meal',
          name: 'Pizza meal',
          price: 15,
          priceOptions: [],
          mealDeal: deal,
        },
      ],
    },
  ]
  const labels = []
  const app = createSSRApp({
    setup: () => ({
      sections,
      pending: false,
      money: (n) => `CHF ${n}`,
      emit: () => {
        throw new Error('No order action expected')
      },
    }),
    render: compile(template),
  })
  app.component('UButton', {
    props: ['label'],
    setup: (props) => {
      labels.push(props.label)
      return () => h('button', props.label)
    },
  })
  app.component('MenuDetailMealDeal', {
    props: ['deal', 'formatPrice'],
    setup: () => () => h('div', 'Meal choices'),
  })
  const html = await renderToString(app)
  assert.deepEqual(labels, ['Add · CHF 13'])
  assert.match(html, /Meal choices/)
  assert.match(html, /CHF 15/)
})

for (const state of ['missing', 'archived']) {
  test(`unavailable ${state} Dish hides its entries and incomplete deals without breaking the Menu`, async () => {
    const f = fixture()
    if (state === 'missing') f.records.delete('kitchens/k/dishes/d')
    else f.records.get('kitchens/k/dishes/d').status = 'archived'
    f.records.set('kitchens/k/menus/m/sections/s/items/other', {
      dish_id: 'swiss',
      sort_order: 2,
    })
    const before = structuredClone(f.records)
    const sections = await f.read()
    assert.deepEqual(
      sections[0].items.map((item) => item.name),
      ['Swiss']
    )
    assert.equal(sections[0].items[0].price, 20)
    assert.deepEqual(f.records, before)
  })
}

test('public Menu omits an unpriced item, keeps other entries and displays explicit zero', async () => {
  const f = fixture()
  delete f.records.get('kitchens/k/dishes/d').price
  const before = structuredClone(f.records)
  const sections = await f.read()
  assert.equal(
    sections[0].items.some((item) => item.id === 'dish'),
    false
  )
  assert.ok(sections[0].items.some((item) => item.id === 'deal'))
  assert.deepEqual(f.records, before)
  f.records.get('kitchens/k/dishes/d').price = 0
  const priced = await f.read()
  assert.equal(priced[0].items.find((item) => item.id === 'dish').price, 0)
})
