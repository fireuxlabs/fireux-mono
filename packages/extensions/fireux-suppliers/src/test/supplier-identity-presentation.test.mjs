import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { placeIdentityMedia } from '../../../fireux-places/src/runtime/place/utils/place-identity-media.ts'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, deps) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const script = (
    source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)?.[1] || source
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(script)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('Supplier Home never turns a pending or failed read into a Choose prompt or stale profile', async () => {
  const path = 'supplier/components/Workspace/Home/Single.vue'
  const source = readFileSync(new URL(path, runtime), 'utf8')
  for (const outcome of ['pending', 'error', 'empty', 'ready']) {
    const props = { outcome, entity: { id: 's' } }
    const state = load(path, '({card})', {
      computed,
      defineProps: () => props,
      useSupplierInterface: () => ({
        pill: (entity) => ({
          id: entity.id,
          title: 'SAVED BUSINESS',
          to: '/suppliers/s',
        }),
      }),
    })
    const app = createSSRApp({
      setup: () => ({ ...props, ...state }),
      render: compile(
        source.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
      ),
    })
    app.config.warnHandler = () => {}
    app.component('FireStateCard', {
      props: ['loading', 'state'],
      setup: (p) => () =>
        h('div', { 'data-state': p.loading ? 'loading' : p.state }),
    })
    app.component('WorkspaceTargetCard', {
      props: ['card'],
      setup: (p) => () => h('a', { href: p.card.to }, p.card.title),
    })
    app.component('UButton', {
      props: ['to', 'label'],
      setup: (p) => () => h('a', { href: p.to }, p.label),
    })
    const html = await renderToString(app)
    if (outcome === 'ready')
      assert.match(html, /href="\/workspace\/supplier\/identity"/)
    else {
      assert.doesNotMatch(html, /SAVED BUSINESS/)
      if (outcome === 'empty') assert.match(html, /Choose a supplier/)
      else {
        assert.doesNotMatch(html, /Choose a supplier/)
        assert.match(html, /data-state=/)
      }
    }
  }
})

test('Supplier public identity renders the same passed Place used by SEO without a second Business reader', async () => {
  const detail = readFileSync(
    new URL('supplier/components/Detail/Index.vue', runtime),
    'utf8'
  )
  const path = 'supplier/components/Detail/Header.vue'
  const header = readFileSync(new URL(path, runtime), 'utf8')
  assert.match(detail, /SupplierDetailHeader[^>]*:place="place"/)
  assert.doesNotMatch(detail, /SupplierDetailBusiness/)
  assert.doesNotMatch(header, /useBusinessDetail/)
  const props = {
    supplier: {
      id: 'opaque-supplier-id',
      business_id: 'opaque-business-id',
      identity: { slug: 'old-slug' },
    },
    place: {
      id: 'opaque-business-id',
      name: 'THE BUSINESS',
      logo_image: '/business-logo.png',
    },
  }
  let seo
  load(path, '({})', {
    computed,
    defineProps: () => props,
    useSupplierSeo: (supplier, place) => {
      seo = [supplier.value, place.value]
    },
  })
  const app = createSSRApp({
    setup: () => props,
    render: compile(
      header.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
    ),
  })
  app.config.warnHandler = () => {}
  app.component('UButton', { setup: () => () => h('a', 'All Suppliers') })
  app.component('PlaceDetailHeader', {
    props: ['place'],
    setup: (p) => () => h('h1', p.place.name),
  })
  const html = await renderToString(app)
  assert.match(html, /THE BUSINESS/)
  assert.doesNotMatch(html, /opaque-supplier-id|opaque-business-id|old-slug/)
  assert.equal(seo[0], props.supplier)
  assert.equal(seo[1], props.place)
})

test('Supplier Overview preserves supplied identity, media, delivery counts and fallbacks', async () => {
  const path = 'supplier/components/Cards/Overview.vue'
  const source = readFileSync(new URL(path, runtime), 'utf8')
  async function render(supplier) {
    const props = { supplier }
    const state = load(
      path,
      '({title,headline,summary,media,imageUrl,headquartersLabel,status,categories,deliveryAreas})',
      { computed, defineProps: () => props, placeIdentityMedia }
    )
    const app = createSSRApp({
      setup: () => ({ ...props, ...state }),
      render: compile(
        source.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
      ),
    })
    app.component('UCard', {
      setup:
        (_, { slots }) =>
        () =>
          h('article', slots.default?.()),
    })
    app.component('UChip', { setup: () => () => h('span') })
    app.component('UIcon', {
      props: ['name'],
      setup: (p) => () => h('i', { 'data-icon': p.name }),
    })
    app.component('UBadge', {
      setup:
        (_, { slots }) =>
        () =>
          h('span', slots.default?.()),
    })
    return renderToString(app)
  }

  const html = await render({
    id: 'supplier-a',
    identity: { status: 'active' },
    delivery: { areas: [' Bern ', '', ' Zürich '] },
    business_place: {
      short_name: 'Local Food',
      name: 'Local Food Wholesale',
      tagline: 'Local deliveries',
      about: 'Fresh produce',
      logo_image: '/supplier.svg',
      image_url: '/supplier.jpg',
      media_backdrop_color: '#f0f0f0',
      short_address: 'Bern',
    },
  })
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
  for (const content of [
    'Local Food',
    'Local deliveries',
    'Fresh produce',
    'Status: active',
    'Categories: 0',
    'Delivery areas: 2',
    'Headquarters: Bern',
  ])
    assert.ok(text.includes(content), content)
  assert.match(html, /src="\/supplier.svg"/)
  assert.match(html, /alt="Local Food"/)
  assert.match(html, /loading="lazy"/)
  assert.match(html, /object-fit:contain/)
  assert.match(html, /background-color:#f0f0f0/)
  assert.doesNotMatch(html, /src="\/supplier.jpg"/)

  const photo = await render({
    id: 'supplier-a',
    business_place: { name: 'Photo Supplier', image_url: '/supplier.jpg' },
  })
  assert.match(photo, /src="\/supplier.jpg"/)
  assert.match(photo, /object-fit:cover/)
  assert.doesNotMatch(photo, /background-color:/)

  const fallback = await render({ id: 'fallback-supplier' })
  assert.match(fallback, /fallback-supplier/)
  assert.match(fallback, /Linked/)
  assert.match(fallback, /data-icon="i-lucide-truck"/)
  assert.doesNotMatch(fallback, /<img/)
  assert.doesNotMatch(await render(null), /<article/)
})
