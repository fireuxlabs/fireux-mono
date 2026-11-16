import test from 'node:test'
import { formatCurrencyAmount } from '../runtime/utils/currency-display.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
import { computed, ref, toRef, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const base = new URL('../runtime/kitchen/components/', import.meta.url)
const read = (path) => readFileSync(new URL(path, base), 'utf8')
const template = (source) =>
  source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
const collectionCellSource = readFileSync(
  new URL(
    '../runtime/kitchen/utils/kitchen-interface-projection.ts',
    import.meta.url
  ),
  'utf8'
)
const toKitchenCollectionCell = compileFunction(
  stripTypeScriptTypes(
    collectionCellSource
      .replace(/^import[^\n]+\n/gm, '')
      .replace(/^export /gm, '')
  ) + ';return toKitchenCollectionCell'
)()

test('public Kitchen routes retain the shared host layout and its single page landmark', async () => {
  const routeMeta = (path) => {
    const source = readFileSync(
      new URL('../runtime/pages/' + path, import.meta.url),
      'utf8'
    )
    const declaration = source.match(/definePageMeta\((\{[\s\S]*?\})\)/)
    assert.ok(declaration, path)
    return compileFunction('return ' + declaration[1])()
  }
  for (const path of [
    'kitchens/index.vue',
    'menus/index.vue',
    'kitchens/[slug]/index.vue',
    'kitchens/[slug]/menu.vue',
    'kitchens/[slug]/menu.collection.vue',
    'kitchens/[slug]/menu.delivery.vue',
  ])
    assert.equal(routeMeta(path).layout || 'default', 'default', path)
  assert.equal(routeMeta('kitchens/create.vue').layout, 'default')
  assert.equal(routeMeta('kitchens/create.vue').requiresAuth, true)

  const coreSource = (path) =>
    readFileSync(
      new URL(
        '../../../../core/fireux-core/src/runtime/' + path,
        import.meta.url
      ),
      'utf8'
    )
  const app = createSSRApp({
    render: compile(template(coreSource('app/components/FireuxApp.vue'))),
  })
  const slotElement = (tag) => ({
    setup: (_, context) => () => h(tag, context.slots.default?.()),
  })
  app.component('NuxtLayout', {
    render: compile(template(coreSource('layouts/default.vue'))),
  })
  for (const name of ['UApp', 'UContainer', 'ClientOnly'])
    app.component(name, slotElement('div'))
  app.component('UMain', slotElement('main'))
  app.component('NuxtPage', { render: () => h('article', 'Customer content') })
  app.component('FireLayoutsDefaultHeader', {
    render: () => h('header', { 'data-host-header': true }),
  })
  app.component('FireLayoutsDefaultFooter', {
    render: () => h('footer', { 'data-host-footer': true }),
  })
  for (const name of ['DevOnly', 'FirePwaStatus', 'AppInitializationGate'])
    app.component(name, { render: () => null })
  const html = await renderToString(app)
  assert.equal((html.match(/<main[\s>]/g) || []).length, 1, html)
  assert.equal((html.match(/data-host-header/g) || []).length, 1, html)
  assert.equal((html.match(/data-host-footer/g) || []).length, 1, html)
  assert.match(html, /Customer content/)
})
function script(source) {
  return stripTypeScriptTypes(
    source
      .split('<script setup lang="ts">')[1]
      .split('</script>')[0]
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  )
}
test('real homepage Kitchen cards link to singular public Menu entrances', async () => {
  const cards = ['la-tapberne', 'luna-piccante', 'baeren-ringgenberg'].map(
    (slug) => ({
      name: slug,
      tagline: '',
      discoveryImageUrl: '',
      shortAddress: '',
      hasPublishedMenu: slug !== 'luna-piccante',
      serviceLabels: ['Browse menus', 'Delivery'],
      ...(slug === 'la-tapberne'
        ? {
            special: {
              date: '2026-11-23',
              today: false,
              nextChangeAt: 1,
              slug: 'specials',
              currencyCode: 'CHF',
              items: [
                {
                  id: 'entry',
                  name: 'Octopus Roll',
                  description: 'Served with fries',
                  price: 25,
                },
              ],
            },
          }
        : {}),
      to: '/kitchens/' + slug,
      badges: [],
      categoryLabels: ['Spanish'],
    })
  )
  const source = read('Public/Collection/List.vue')
  const cells = compileFunction(script(source) + ';return cells.value', [
    'computed',
    'ref',
    'defineProps',
    'toKitchenCollectionCell',
  ])(computed, ref, () => ({ cards }), toKitchenCollectionCell)
  const app = createSSRApp({
    setup: () => ({ cells, props: { cards } }),
    render: compile(template(source)),
  })
  app.component('UPageGrid', {
    setup: (_, ctx) => () => h('ul', ctx.slots.default?.()),
  })
  const linkComponent = {
    props: ['to'],
    setup: (props, ctx) => () =>
      h('a', { href: props.to }, ctx.slots.default?.()),
  }
  app.component('NuxtLink', linkComponent)
  app.component('UButton', {
    props: ['to', 'label'],
    setup: (props) => () => h('a', { href: props.to }, props.label),
  })
  const cardSource = read('Public/Collection/Card/Index.vue')
  app.component('PublicKitchenCollectionCard', {
    props: ['card'],
    setup: (props) =>
      compileFunction(script(cardSource) + ';return {props,cell,services}', [
        'computed',
        'defineProps',
        'toKitchenCollectionCell',
      ])(computed, () => props, toKitchenCollectionCell),
    render: compile(template(cardSource)),
  })
  for (const [name, props] of [
    ['Identity', ['cell']],
    ['Labels', ['label', 'labels']],
  ]) {
    const source = read(`Public/Collection/Card/${name}.vue`)
    app.component(`PublicKitchenCollectionCard${name}`, {
      props,
      render: compile(template(source)),
    })
  }
  const specialSource = read('Public/Collection/Card/Special.vue')
  app.component('PublicKitchenCollectionCardSpecial', {
    props: ['special', 'kitchenPath'],
    setup: (props) =>
      compileFunction(
        script(specialSource) + ';return {dateLabel,specialPath}',
        ['computed', 'defineProps']
      )(computed, () => props),
    render: compile(template(specialSource)),
  })
  const itemSource = read('Public/Collection/Card/SpecialItem.vue')
  app.component('PublicKitchenCollectionCardSpecialItem', {
    props: ['item', 'currencyCode'],
    setup: (props) =>
      compileFunction(script(itemSource) + ';return {price}', [
        'computed',
        'defineProps',
        'formatCurrencyAmount',
      ])(computed, () => props, formatCurrencyAmount),
    render: compile(template(itemSource)),
  })
  app.component('MenuItemImage', {
    props: ['enabled', 'imageUrl'],
    setup: (props) => () =>
      props.enabled && props.imageUrl
        ? h('img', { src: props.imageUrl })
        : null,
  })
  app.component('UAlert', {
    props: ['title', 'description', 'actions'],
    setup: (props, ctx) => () =>
      h('aside', [
        props.title,
        ctx.slots.description?.() || props.description,
        ...props.actions.map((action) =>
          h('a', { href: action.to }, action.label)
        ),
      ]),
  })
  for (const name of ['UCard', 'UBadge', 'UPageCard', 'UAvatar'])
    app.component(name, {
      setup: (_, ctx) => () => h('div', ctx.slots.default?.()),
    })
  app.component('UIcon', { render: () => null })
  app.component('FireDiagnosticsDebugPanel', { render: () => null })
  const html = await renderToString(app)
  for (const card of cards)
    assert.ok(html.includes(`href="${card.to}/menu"`), html)
  assert.ok(!html.includes('/menus"'), html)
  assert.ok(!html.includes('Browse menus'), html)
  assert.match(html, /aria-label="Keywords"/)
  assert.match(html, /aria-label="Services"/)
  assert.match(html, /Upcoming special/)
  assert.match(html, /href="\/kitchens\/la-tapberne\/menus\/specials"/)
  assert.match(html, /23 November 2026/)
  assert.match(html, /Octopus Roll/)
  assert.match(html, /25 CHF/)
  assert.match(html, /Served with fries/)
  assert.ok(!html.includes('Service details not published'), html)
})

test('Kitchen discovery projection keeps supplied services and normalizes the Menu link', () => {
  const card = {
    name: 'La Tapberne',
    tagline: 'Alpine Swiss Tapas',
    discoveryImageUrl: '/pulpo.jpg',
    shortAddress: 'Bern',
    badges: ['Hidden'],
    categoryLabels: ['Tapas'],
    serviceLabels: ['Browse menus', 'Delivery', 'Delivery'],
    hasPublishedMenu: true,
    to: '/kitchens/la-tapberne/',
  }
  const cell = toKitchenCollectionCell(card)
  assert.equal(cell.to, '/kitchens/la-tapberne/menu')
  assert.deepEqual(cell.badges, ['Hidden', 'Tapas'])
  assert.equal(cell.image, card.discoveryImageUrl)
  assert.deepEqual(card.serviceLabels, ['Browse menus', 'Delivery', 'Delivery'])

  const unavailable = toKitchenCollectionCell({
    ...card,
    hasPublishedMenu: false,
    to: '',
  })
  assert.equal(unavailable.to, '')
  assert.ok(!unavailable.badges.includes('Browse menus'))
})
async function currency(service, place) {
  const spine = readFileSync(
    new URL(
      '../../../../extensions/fireux-places/src/runtime/place/utils/place-spine.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const readPlaceCurrencyCode = compileFunction(
    stripTypeScriptTypes(spine) + ';return readPlaceCurrencyCode'
  )()
  const props = { service, kitchenSlug: 'venue' }
  const deps = {
    computed,
    toRef,
    defineProps: () => props,
    defineEmits: () => () => {},
    readPlaceCurrencyCode,
    useAsyncData: () => ({
      data: ref({ sources: [] }),
      pending: ref(false),
      error: ref(null),
    }),
    directoryMenuRouteScope: (x) => x,
    menuRouteIndexPath: () => '/kitchens/venue/menu',
    useKitchenOfferingNow: () => ({ now: ref(new Date()) }),
    serviceSections: () => [],
    useMenuThemeSurface: () => ({ styleVars: ref({}) }),
    useKitchenDetail: () => ({
      kitchen: ref({}),
      place,
      presentation: ref({}),
      outcome: ref('ready'),
      statusCode: ref(0),
      ready: Promise.resolve(),
    }),
    useRoute: () => ({ query: {} }),
    useHead: () => {},
    useSeoMeta: () => {},
    setResponseStatus: () => {},
  }
  const code = script(read('Detail/ServiceMenu.vue')).replace(
    /import\.meta\.server/g,
    'false'
  )
  return compileFunction(
    `return (async()=>{${code};return currencyCode})()`,
    Object.keys(deps)
  )(...Object.values(deps))
}
for (const service of ['collection', 'delivery'])
  test(`${service} shows the current Place currency once in the shared heading`, async () => {
    const place = ref({ default_currency_code: 'CHF' })
    const code = await currency(service, place)
    assert.equal(code.value, 'CHF')
    const source = read('Detail/MenuHeader.vue')
    const app = createSSRApp({
      setup: () => ({
        venue: { display_name: 'Venue' },
        venuePath: '/venue',
        title: service,
        currencyCode: code,
        logoFailed: false,
        prominent: false,
        coverFailed: false,
        coverUrl: '',
      }),
      render: compile(template(source)),
    })
    app.component('UButton', { render: () => null })
    app.component('UPageHeader', {
      props: ['title', 'description'],
      setup: (props) => () =>
        h('header', [h('h1', props.title), h('p', props.description)]),
    })
    const html = await renderToString(app)
    assert.equal((html.match(/Prices in CHF/g) || []).length, 1, html)
    place.value = { default_currency_code: 'EUR' }
    assert.equal(
      code.value,
      'EUR',
      'currency follows Place rather than a hardcoded CHF label'
    )
    place.value = {}
    assert.equal(code.value, '', 'missing currency does not invent a currency')
  })
