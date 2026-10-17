import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, reactive, ref, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/components/Detail/MenuServices.vue',
    import.meta.url
  ),
  'utf8'
)
async function services(active) {
  const props = reactive({ kitchenSlug: 'baeren-ringgenberg', active })
  const indexes = {
    collection: {
      pending: ref(false),
      error: ref(null),
      count: ref(1),
      ready: Promise.resolve(),
    },
    delivery: {
      pending: ref(false),
      error: ref(null),
      count: ref(1),
      ready: Promise.resolve(),
    },
  }
  const acquisitions = []
  const deps = {
    computed,
    defineProps: () => props,
    directoryMenuRouteScope: (slug) => ({
      kind: 'directory',
      kitchenSlug: slug,
    }),
    menuRouteIndexPath: (scope, service) =>
      `/kitchens/${scope.kitchenSlug}/menu.${service}`,
    useMenuDirectory: (options) => {
      acquisitions.push(options)
      return indexes[options.service]
    },
  }
  const script = source
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const api = await compileFunction(
    `return (async()=>{${stripTypeScriptTypes(script)};return {props,choices}})()`,
    Object.keys(deps)
  )(...Object.values(deps))
  return { api, indexes, acquisitions }
}
async function render(api) {
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const app = createSSRApp({
    setup: () => ({ ...api, active: api.props.active }),
    render: compile(template),
  })
  app.component('NuxtLink', {
    props: ['to'],
    setup: (props, ctx) => () =>
      h('a', { href: props.to, ...ctx.attrs }, ctx.slots.default?.()),
  })
  app.component('UIcon', { render: () => null })
  return renderToString(app)
}
test('browse entrance presents eligible Collection and Delivery as actions without an All menus tab', async () => {
  const { api, indexes, acquisitions } = await services()
  const html = await render(api)
  assert.ok(
    html.includes('href="/kitchens/baeren-ringgenberg/menu.collection"')
  )
  assert.ok(html.includes('href="/kitchens/baeren-ringgenberg/menu.delivery"'))
  assert.ok(!html.includes('aria-current="page"'))
  assert.ok(!html.includes('All menus'))
  assert.equal(acquisitions.length, 2)
  indexes.delivery.count.value = 0
  assert.deepEqual(
    api.choices.value.map((c) => c.service),
    ['collection']
  )
  indexes.collection.error.value = Error('Unavailable')
  assert.equal(api.choices.value.length, 0)
})
for (const active of ['collection', 'delivery'])
  test(`direct ${active} entrance preserves its intent and can switch services`, async () => {
    const { api, indexes } = await services(active)
    const html = await render(api)
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1)
    assert.ok(
      html.includes(`href="/kitchens/baeren-ringgenberg/menu.${active}"`)
    )
    assert.equal(api.choices.value.length, 2)
    const other = active === 'collection' ? 'delivery' : 'collection'
    indexes[other].pending.value = true
    assert.deepEqual(
      api.choices.value.map((c) => c.service),
      [active]
    )
    api.props.kitchenSlug = 'another-venue'
    assert.ok(api.choices.value[0].to.startsWith('/kitchens/another-venue/'))
  })
