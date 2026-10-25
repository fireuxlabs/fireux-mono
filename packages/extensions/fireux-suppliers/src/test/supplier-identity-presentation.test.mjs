import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
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
test('Supplier Overview presents the exact settled joined business identity, clearing it on read failure and selection changes', () => {
  const workspace = {
    id: ref('s'),
    data: ref({ id: 's', company_id: 'company' }),
    outcome: ref('ready'),
  }
  const joined = {
    id: 's',
    company_id: 'company',
    company_place: { id: 'company', name: 'Business', logo_image: '/logo.png' },
  }
  const index = { collection: ref([joined]), outcome: ref('ready') }
  const useOverview = load(
    '../../../../core/fireux-core/src/runtime/composables/fireux/useOverview.ts',
    'useOverview',
    { computed }
  )
  const state = load(
    'supplier/composables/useSupplierOverview.ts',
    'useSupplierOverview()',
    {
      computed,
      useOverview,
      useSupplierWorkspace: () => workspace,
      useSupplierWorkspaceIndex: () => index,
    }
  )
  assert.equal(state.focus.value.entity.company_place.name, 'Business')
  index.outcome.value = 'error'
  assert.equal(state.focus.value.outcome, 'error')
  assert.equal(state.focus.value.entity, null)
  index.outcome.value = 'ready'
  workspace.id.value = 'other'
  assert.equal(state.focus.value.outcome, 'missing')
  assert.equal(state.focus.value.entity, null)
  workspace.outcome.value = 'pending'
  assert.equal(state.focus.value.outcome, 'pending')
})
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

test('Supplier public identity renders the same passed Place used by SEO without a second Company reader', async () => {
  const detail = readFileSync(
    new URL('supplier/components/Detail/Index.vue', runtime),
    'utf8'
  )
  const path = 'supplier/components/Detail/Header.vue'
  const header = readFileSync(new URL(path, runtime), 'utf8')
  assert.match(detail, /SupplierDetailHeader[^>]*:place="place"/)
  assert.doesNotMatch(detail, /SupplierDetailCompany/)
  assert.doesNotMatch(header, /useCompanyDetail/)
  const props = {
    supplier: {
      id: 'opaque-supplier-id',
      company_id: 'opaque-company-id',
      identity: { slug: 'old-slug' },
    },
    place: {
      id: 'opaque-company-id',
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
  assert.doesNotMatch(html, /opaque-supplier-id|opaque-company-id|old-slug/)
  assert.equal(seo[0], props.supplier)
  assert.equal(seo[1], props.place)
})
