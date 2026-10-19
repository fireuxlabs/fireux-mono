import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  compile,
  computed,
  createRenderer,
  h,
  nextTick,
  ref,
  toValue,
} from 'vue'

function load(path, names, context = {}) {
  const source = readFileSync(
    new URL('../runtime/' + path + '.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `; return {${names}}`,
    Object.keys(context)
  )(...Object.values(context))
}
const policy = load(
  'menu/utils/service-basket',
  'serviceBasketLine,serviceItemSignature'
)
const { useServiceBasket } = load(
  'menu/composables/useServiceBasket',
  'useServiceBasket',
  { computed, ref, toValue, ...policy }
)
const offer = (menuId = 'food', changes = {}) => ({
  source: { kitchenId: 'venue', menuId, sectionId: 'section' },
  presentation: { currencyCode: 'CHF' },
  offerings: [{ id: 'collection' }],
  label: 'Food',
  item: {
    id: 'item',
    dishId: 'dish',
    name: 'Pizza',
    price: 13,
    priceOptions: [],
    addOns: [],
    ...changes,
  },
})
const choices = (changes = {}) => ({
  optionId: '',
  extraIds: [],
  groups: {},
  quantity: 1,
  ...changes,
})

test('one basket holds Food and Drinks with complete source identity and exact totals', () => {
  const food = offer(),
    drink = offer('drinks', { name: 'Cola', price: 4 })
  const basket = useServiceBasket([food, drink])
  basket.add(food, choices({ quantity: 2 }))
  basket.add(drink, choices())
  assert.equal(basket.count.value, 3)
  assert.equal(basket.totalMinor.value, 3000)
  assert.deepEqual(
    basket.lines.value.map((line) => line.source.menuId),
    ['food', 'drinks']
  )
  assert.equal(basket.lines.value[0].source.sectionId, 'section')
  assert.equal(basket.lines.value[0].itemId, 'item')
  assert.deepEqual(basket.lines.value[0].offeringIds, ['collection'])
})
test('options replace the base price and selected extras add once, without modifying catalogue prices', () => {
  const item = offer('food', {
    priceOptions: [{ id: 'large', label: 'Large', price: 15.25 }],
    addOns: [{ id: 'cheese', label: 'Cheese', price: 1.5 }],
  })
  const before = structuredClone(item)
  assert.throws(() => policy.serviceBasketLine(item, choices()), /option/)
  const line = policy.serviceBasketLine(
    item,
    choices({ optionId: 'large', extraIds: ['cheese', 'cheese'], quantity: 2 })
  )
  assert.equal(line.unitMinor, 1675)
  assert.deepEqual(line.details, ['Large', 'Cheese'])
  assert.deepEqual(item, before)
  assert.throws(
    () =>
      policy.serviceBasketLine(
        item,
        choices({ optionId: 'large', extraIds: ['missing'] })
      ),
    /extra/
  )
})
test('identical choices merge, different choices stay separate and removal recalculates totals', () => {
  const item = offer('food', {
    addOns: [{ id: 'cheese', label: 'Cheese', price: 1 }],
  })
  const basket = useServiceBasket([item])
  basket.add(item, choices())
  basket.add(item, choices())
  basket.add(item, choices({ extraIds: ['cheese'] }))
  assert.equal(basket.lines.value.length, 2)
  assert.equal(basket.totalMinor.value, 4000)
  basket.adjust(basket.lines.value[0].key, -1)
  assert.equal(basket.totalMinor.value, 2700)
  basket.remove(basket.lines.value[1].key)
  basket.adjust(basket.lines.value[0].key, -1)
  assert.equal(basket.count.value, 0)
})
test('stale catalogue entries are flagged without silently changing basket prices', () => {
  const original = offer(),
    current = ref([original])
  const basket = useServiceBasket(current)
  basket.add(original, choices())
  current.value = [offer('food', { price: 14 })]
  assert.equal(basket.staleKeys.value.length, 1)
  assert.equal(basket.totalMinor.value, 1300)
  assert.throws(() => basket.add(original, choices()), /changed/)
  current.value = []
  assert.equal(basket.staleKeys.value.length, 1)
})
test('meal deal choices and supplements are required and free items remain valid', () => {
  const deal = offer('food', {
    price: 15,
    mealDeal: {
      groups: [
        {
          id: 'main',
          name: 'Main',
          choose: 1,
          dishes: [{ dishId: 'pizza', name: 'Pizza', supplement: 2 }],
        },
      ],
    },
  })
  assert.throws(() => policy.serviceBasketLine(deal, choices()), /Choose 1/)
  assert.equal(
    policy.serviceBasketLine(deal, choices({ groups: { main: ['pizza'] } }))
      .unitMinor,
    1700
  )
  assert.equal(
    policy.serviceBasketLine(offer('food', { price: 0 }), choices()).unitMinor,
    0
  )
})
test('quantity bounds, incompatible currencies and separate basket instances are respected', () => {
  const item = offer(),
    basket = useServiceBasket([item])
  assert.throws(() => basket.add(item, choices({ quantity: 0 })), /quantity/)
  assert.throws(() => basket.add(item, choices({ quantity: 1.5 })), /quantity/)
  basket.add(item, choices({ quantity: 99 }))
  assert.throws(() => basket.add(item, choices()), /99/)
  assert.equal(useServiceBasket([item]).lines.value.length, 0)
  const other = { ...offer('drinks'), presentation: { currencyCode: 'EUR' } }
  const mixed = useServiceBasket([item, other])
  mixed.add(item, choices())
  assert.throws(() => mixed.add(other, choices()), /currencies/)
})

test('bottle deposit requires a deliberate choice and keeps normal drink prices unchanged', () => {
  const drink = offer('drinks', { name: 'Cola', price: 4, bottleDeposit: 10 })
  const before = structuredClone(drink)
  assert.throws(
    () => policy.serviceBasketLine(drink, choices()),
    /new bottle or a bottle exchange/
  )
  assert.throws(
    () => policy.serviceBasketLine(drink, choices({ bottle: 'other' })),
    /new bottle/
  )
  const deposit = policy.serviceBasketLine(
    drink,
    choices({ bottle: 'deposit', quantity: 2 })
  )
  const exchange = policy.serviceBasketLine(
    drink,
    choices({ bottle: 'exchange' })
  )
  assert.equal(deposit.depositUnitMinor, 1000)
  assert.equal(deposit.unitMinor, 1400)
  assert.equal(exchange.depositUnitMinor, 0)
  assert.equal(exchange.unitMinor, 400)
  assert.notEqual(deposit.key, exchange.key)
  assert.deepEqual(drink, before)
  assert.throws(
    () => policy.serviceBasketLine(offer(), choices({ bottle: 'deposit' })),
    /does not have/
  )
})

test('new bottles and exchanges stay separate and deposits follow quantity and removal', () => {
  const drink = offer('drinks', { name: 'Cola', price: 4, bottleDeposit: 10 })
  const basket = useServiceBasket([drink])
  basket.add(drink, choices({ bottle: 'deposit', quantity: 2 }))
  basket.add(drink, choices({ bottle: 'exchange' }))
  assert.equal(basket.totalMinor.value, 3200)
  assert.equal(basket.lines.value.length, 2)
  basket.add(drink, choices({ bottle: 'exchange' }))
  assert.equal(basket.lines.value.length, 2)
  assert.equal(basket.totalMinor.value, 3600)
  basket.adjust(basket.lines.value[0].key, -1)
  assert.equal(basket.totalMinor.value, 2200)
  basket.remove(basket.lines.value[0].key)
  assert.equal(basket.totalMinor.value, 800)
})

test('deposit changes invalidate existing selections and malformed charges cannot enter the basket', () => {
  const sources = ref([offer('drinks', { price: 4, bottleDeposit: 10 })])
  const basket = useServiceBasket(sources)
  basket.add(sources.value[0], choices({ bottle: 'exchange' }))
  sources.value = [offer('drinks', { price: 4, bottleDeposit: 12 })]
  assert.equal(basket.staleKeys.value.length, 1)
  for (const bottleDeposit of [-1, NaN, Infinity, Number.MAX_VALUE])
    assert.throws(
      () =>
        policy.serviceBasketLine(
          offer('drinks', { bottleDeposit }),
          choices({ bottle: 'deposit' })
        ),
      /valid price/
    )
})

test('absent and disabled deposits leave ordinary options and extras unchanged', () => {
  for (const deposit of [{}, { bottleDeposit: 0 }]) {
    const item = offer('drinks', {
      price: 4,
      priceOptions: [{ id: 'large', label: 'Large', price: 5 }],
      addOns: [{ id: 'extra', label: 'Extra', price: 0.5 }],
      ...deposit,
    })
    const before = structuredClone(item)
    const line = policy.serviceBasketLine(
      item,
      choices({ optionId: 'large', extraIds: ['extra'], quantity: 2 })
    )
    assert.equal(line.unitMinor, 550)
    assert.equal(line.depositUnitMinor, 0)
    assert.equal(line.choices.bottle, undefined)
    assert.deepEqual(item, before)
  }
})

test('deposit choices stay local to their drink in a mixed basket', () => {
  const food = offer('food', { price: 11, promotionLabel: 'Sunday pizzas' })
  const drink = offer('drinks', { price: 4, bottleDeposit: 10 })
  const basket = useServiceBasket([food, drink])
  const before = structuredClone([food, drink])
  basket.add(food, choices())
  basket.add(drink, choices({ bottle: 'deposit' }))
  assert.equal(basket.totalMinor.value, 2500)
  assert.equal(basket.lines.value[0].unitMinor, 1100)
  assert.equal(basket.lines.value[0].depositUnitMinor, 0)
  basket.remove(basket.lines.value[1].key)
  assert.equal(basket.totalMinor.value, 1100)
  assert.deepEqual([food, drink], before)
})

test('Collection keeps the same basket through refresh, error, empty recovery and changed items', async () => {
  const template = readFileSync(
    new URL(
      '../runtime/kitchen/components/Detail/ServiceMenu.vue',
      import.meta.url
    ),
    'utf8'
  ).match(/<template>([\s\S]*?)<\/template>\n<script/)[1]
  const original = offer()
  const pending = ref(false)
  const error = ref(null)
  const presentation = ref({ display_name: 'Venue' })
  const offeringId = ref('')
  const kitchenSlug = ref('venue')
  const sections = ref([{ items: [{ ...original, alternatives: [] }] }])
  let basket,
    mounts = 0,
    disposals = 0
  const Selection = {
    props: ['sections', 'catalogueReady', 'currencyCode'],
    setup(props) {
      mounts++
      basket = useServiceBasket(
        computed(() => props.sections.flatMap((section) => section.items)),
        () => props.catalogueReady
      )
      return () => h('div', String(basket.count.value))
    },
    unmounted() {
      disposals++
    },
  }
  const node = () => ({ children: [], parent: null })
  const renderer = createRenderer({
    createElement: node,
    createText: node,
    createComment: node,
    insert(child, parent, anchor = null) {
      if (child.parent) {
        const siblings = child.parent.children
        siblings.splice(siblings.indexOf(child), 1)
      }
      child.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      parent.children.splice(
        index < 0 ? parent.children.length : index,
        0,
        child
      )
    },
    remove(child) {
      const siblings = child.parent?.children
      if (siblings) siblings.splice(siblings.indexOf(child), 1)
      child.parent = null
    },
    setElementText() {},
    setText() {},
    setComment() {},
    patchProp() {},
    parentNode: (child) => child.parent,
    nextSibling(child) {
      const siblings = child.parent?.children || []
      return siblings[siblings.indexOf(child) + 1] || null
    },
  })
  const app = renderer.createApp({
    setup: () => ({
      presentation,
      service: 'collection',
      kitchenSlug,
      offeringId,
      venuePath: '/kitchens/venue',
      serviceLabel: 'Collection',
      currencyCode: 'CHF',
      roomNumber: '',
      tableNumber: '',
      selectedOffering: null,
      kitchen: {},
      outcome: 'ready',
      sections,
      menus: { pending, error, refresh() {} },
      refresh() {},
      styleVars: {},
    }),
    render: compile(template),
  })
  const Stub = { setup: () => () => h('div') }
  for (const tag of new Set(
    [...template.matchAll(/<([A-Z]\w*)/g)].map((match) => match[1])
  ))
    app.component(tag, tag === 'MenuSelection' ? Selection : Stub)
  app.mount(node())
  try {
    basket.add(original, choices({ quantity: 2 }))
    const owner = basket
    pending.value = true
    await nextTick()
    assert.equal(basket, owner)
    assert.equal(basket.count.value, 2)
    assert.equal(basket.totalMinor.value, 2600)
    assert.deepEqual(basket.staleKeys.value, [])
    assert.throws(() => basket.add(original, choices()), /reloading/)
    basket.adjust(basket.lines.value[0].key, 1)
    assert.equal(basket.count.value, 2)

    pending.value = false
    error.value = new Error('Catalogue unavailable')
    sections.value = []
    presentation.value = null
    await nextTick()
    assert.equal(basket, owner)
    assert.equal(basket.count.value, 2)
    assert.deepEqual(
      basket.staleKeys.value,
      [],
      'failure does not claim that every item was removed'
    )
    basket.adjust(basket.lines.value[0].key, -1)
    assert.equal(basket.count.value, 1)

    presentation.value = { display_name: 'Venue' }
    error.value = null
    sections.value = [{ items: [{ ...original, alternatives: [] }] }]
    await nextTick()
    assert.equal(basket, owner)
    assert.deepEqual(basket.staleKeys.value, [])

    sections.value = [
      { items: [{ ...offer('food', { price: 14 }), alternatives: [] }] },
    ]
    await nextTick()
    assert.deepEqual(basket.staleKeys.value, [basket.lines.value[0].key])
    assert.equal(
      basket.totalMinor.value,
      1300,
      'existing choices are never silently repriced'
    )
    basket.adjust(basket.lines.value[0].key, 1)
    assert.equal(basket.count.value, 1)

    sections.value = []
    await nextTick()
    assert.equal(basket, owner)
    assert.equal(
      basket.staleKeys.value.length,
      1,
      'settled empty catalogue marks the item unavailable'
    )
    assert.equal(mounts, 1)
    assert.equal(disposals, 0)
    basket.remove(basket.lines.value[0].key)
    assert.equal(basket.count.value, 0)
    assert.equal(original.item.price, 13)

    sections.value = [{ items: [{ ...original, alternatives: [] }] }]
    await nextTick()
    basket.add(original, choices())
    offeringId.value = 'separate-collection'
    await nextTick()
    assert.notEqual(basket, owner)
    assert.equal(
      basket.count.value,
      0,
      'another service entrance has a separate basket'
    )
    assert.equal(mounts, 2)
    assert.equal(disposals, 1)
    kitchenSlug.value = 'another-venue'
    await nextTick()
    assert.equal(basket.count.value, 0)
    assert.equal(mounts, 3)
  } finally {
    app.unmount()
  }
  assert.equal(disposals, 3)
})
