import test from 'node:test'
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
      hasPublishedMenu: slug !== 'luna-piccante',
      serviceLabels: ['Browse menus'],
      to: '/kitchens/' + slug,
      badges: [],
      categoryLabels: [],
    })
  )
  const source = read('Collection/List.vue')
  const cells = compileFunction(script(source) + ';return cells.value', [
    'computed',
    'defineProps',
  ])(computed, () => ({ cards }))
  const app = createSSRApp({
    setup: () => ({ cells, props: { cards } }),
    render: compile(template(source)),
  })
  app.component('UPageGrid', {
    setup: (_, ctx) => () => h('ul', ctx.slots.default?.()),
  })
  app.component('UPageCard', {
    props: ['to'],
    setup: (props, ctx) => () =>
      h('a', { href: props.to }, ctx.slots.footer?.()),
  })
  app.component('UBadge', {
    setup: (_, ctx) => () => h('span', ctx.slots.default?.()),
  })
  app.component('FireDiagnosticsDebugPanel', { render: () => null })
  const html = await renderToString(app)
  for (const card of cards)
    assert.ok(html.includes(`href="${card.to}/menu"`), html)
  assert.ok(!html.includes('/menus"'), html)
  assert.equal((html.match(/Browse menus/g) || []).length, 2)
  assert.ok(!html.includes('Service details not published'), html)
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
      }),
      render: compile(template(source)),
    })
    app.component('UButton', { render: () => null })
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
