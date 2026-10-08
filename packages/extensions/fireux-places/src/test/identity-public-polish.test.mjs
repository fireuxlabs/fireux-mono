import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  reactive,
  watch,
  effectScope,
  onScopeDispose,
  toValue,
  compile,
  createSSRApp,
  h,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
const runtime = new URL('../runtime/', import.meta.url)
const clean = (source) =>
  source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
function load(path, expression, deps = {}) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const script = source.includes('<script setup')
    ? source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
    : source
  return compileFunction(
    `${stripTypeScriptTypes(clean(script))};return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const scopeSource = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(clean(scopeSource))};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)
const contact = load('place/utils/place-contact.ts', 'placeContactLinks')
test('public contact links expose saved values and omit unusable or unsafe links', async () => {
  const place = {
    name: 'Venue',
    phone: '+41 (33) 123-45-67',
    email: 'hello@example.test',
    social_links: {
      instagram: 'https://instagram.com/venue',
      facebook: 'javascript:alert(1)',
      tiktok: 'https://user:secret@example.test/',
      linkedin: 'broken',
    },
  }
  assert.deepEqual(
    contact(place).map((v) => v.to),
    [
      'tel:+41331234567',
      'mailto:hello%40example.test',
      'https://instagram.com/venue',
    ]
  )
  assert.deepEqual(contact({ phone: 'unknown', email: 'not an email' }), [])
  const source = readFileSync(
    new URL('place/components/Detail/Contact.vue', runtime),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const app = createSSRApp({
    setup: () => ({ place, links: contact(place) }),
    render: compile(template),
  })
  app.component('UButton', {
    props: ['to', 'label'],
    setup: (p) => () => h('a', { href: p.to }, p.label),
  })
  const html = await renderToString(app)
  assert.match(html, /Contact/)
  assert.match(html, /hello@example.test/)
  assert.match(html, /Instagram/)
  assert.doesNotMatch(html, /javascript|secret|Facebook/)
})
test('location command submits one paired sparse patch under existing authority', async () => {
  const scope = effectScope(),
    writes = [],
    published = []
  const update = scope.run(() =>
    load(
      'place/composables/firestore/mutations/usePlaceUpdate.ts',
      'usePlaceUpdate',
      {
        useAuth: () => ({ currentUser: ref({ uid: 'actor' }) }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useUserSession: () => ({
          appUser: ref({ role: 'user' }),
          appPending: ref(false),
          appError: ref(null),
          appOutcome: ref('ready'),
        }),
        useRoute: () => ({ fullPath: '/workspace/kitchen/identity' }),
        useCommandScope,
        inject: () => undefined,
        useRequireUser: async () => ({
          uid: 'actor',
          getIdToken: async () => 'test-token',
        }),
        toValue,
        usePlaceDetailState: () => ({
          publish: (response) => published.push(response),
        }),
        $fetch: async (url, request) => {
          writes.push({ url, request })
          return { place: { id: 'venue', ...request.body.patch } }
        },
      }
    )({ authority: () => ({ appId: 'app', kitchenId: 'venue' }) })
  )
  const saved = await update.updateLocation(
    { formatted_address: ' New street ', short_address: ' New city ' },
    { id: 'venue' }
  )
  assert.equal(writes.length, 1)
  assert.deepEqual(writes[0].request.body, {
    patch: { formatted_address: 'New street', short_address: 'New city' },
    app_id: 'app',
    kitchen_id: 'venue',
  })
  assert.equal(saved.short_address, 'New city')
  assert.equal(published.length, 1)
  // Use the actual public projections on the saved response, without a second copy.
  const kitchenRuntime = '../../../fireux-kitchens/src/runtime/'
  const safeString = (value) => String(value || '')
  const projection = load(
    kitchenRuntime + 'kitchen/utils/kitchen-interface-projection.ts',
    '({meaningfulSurfaceDelta,placeBaselineKeys,resolveKitchenPath})',
    { safeString }
  )
  const spine = load(
    'place/utils/place-spine.ts',
    '({readPlaceCurrencyCode,readMediaBackdropColor})',
    { normalizeHexColor: () => '' }
  )
  const interfaceFactory = load(
    kitchenRuntime + 'kitchen/composables/useKitchenInterface.ts',
    'useKitchenInterface',
    {
      ...projection,
      ...spine,
      safeString,
      readKitchenVisibility: (value) => value.identity.visibility === true,
      readKitchenSproochliConfig: () => ({}),
      toShortAddress: (value) => value,
    }
  )
  const kitchen = {
    id: 'venue',
    identity: { slug: 'venue-url', status: 'active', visibility: true },
  }
  const place = { ...saved, name: 'Venue', gallery_images: [] }
  const presenter = interfaceFactory()
  const card = presenter.identity(presenter.surface({ kitchen, place }))
  assert.equal(card.shortAddress, 'New city')
  assert.equal(card.formattedAddress, 'New street')
  assert.equal(card.to, '/kitchens/venue-url')
  const resolveDetail = load(
    kitchenRuntime + 'kitchen/utils/kitchen-detail-presentation.ts',
    'resolveKitchenDetailPresentation'
  )
  const detail = resolveDetail({}, kitchen, place)
  assert.equal(detail.short_address, card.shortAddress)
  assert.equal(detail.formatted_address, card.formattedAddress)
  await assert.rejects(
    update.updateLocation(
      { formatted_address: 'Another street', short_address: '' },
      { id: 'venue' }
    ),
    /locality/
  )
  assert.equal(writes.length, 1)
  scope.stop()
})
function locationHarness() {
  const scope = effectScope(),
    calls = [],
    feedback = [],
    account = ref({ uid: 'alice' })
  const props = reactive({
    place: {
      id: 'a',
      formatted_address: 'Old street',
      short_address: 'Old city',
    },
    mutationAuthority: { appId: 'app', kitchenId: 'a' },
  })
  let resolve
  const state = scope.run(() =>
    load(
      'place/components/Edit/Location.vue',
      '({address,locality,error,saving,dirty,conflict,save,reset})',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        defineProps: () => props,
        useAuth: () => ({ currentUser: account }),
        useToastify: () => ({ success: (v) => feedback.push(v) }),
        usePlaceUpdate: () => ({
          updateLocation: (patch, ctx) => {
            calls.push({ patch, ctx })
            return new Promise((r) => {
              resolve = r
            })
          },
        }),
      }
    )
  )
  return {
    scope,
    calls,
    feedback,
    account,
    props,
    state,
    resolve: (v) => resolve(v),
  }
}
test('location editing preserves drafts, refuses stale saves and clears successful saving state', async () => {
  const h = locationHarness()
  h.state.address.value = ' New street '
  h.state.locality.value = ' New city '
  const pending = h.state.save()
  assert.deepEqual(h.calls, [
    {
      patch: { formatted_address: ' New street ', short_address: ' New city ' },
      ctx: { id: 'a' },
    },
  ])
  const saved = {
    id: 'a',
    formatted_address: 'New street',
    short_address: 'New city',
  }
  h.props.place = saved
  h.resolve(saved)
  await pending
  assert.equal(h.state.saving.value, false)
  assert.equal(h.state.dirty.value, false)
  assert.deepEqual(h.feedback, ['Location updated'])
  h.state.address.value = 'Unsaved'
  h.props.place = { ...saved, short_address: 'Concurrent city' }
  assert.equal(h.state.conflict.value, true)
  await h.state.save()
  assert.equal(h.calls.length, 1)
  h.state.reset()
  assert.equal(h.state.locality.value, 'Concurrent city')
  h.scope.stop()
})
for (const change of [
  'Place ABA',
  'account ABA',
  'authority ABA',
  'disposal',
]) {
  test(`location ignores late completion after ${change}`, async () => {
    const h = locationHarness()
    h.state.address.value = 'Draft'
    h.state.locality.value = 'Area'
    const pending = h.state.save()
    if (change === 'Place ABA') {
      h.props.place = { ...h.props.place, id: 'b' }
      h.props.place = { ...h.props.place, id: 'a' }
    }
    if (change === 'account ABA') {
      h.account.value = { uid: 'bob' }
      h.account.value = { uid: 'alice' }
    }
    if (change === 'authority ABA') {
      h.props.mutationAuthority.kitchenId = 'b'
      h.props.mutationAuthority.kitchenId = 'a'
    }
    if (change === 'disposal') h.scope.stop()
    h.resolve({ id: 'a', formatted_address: 'Draft', short_address: 'Area' })
    await pending
    assert.deepEqual(h.feedback, [])
    h.scope.stop()
  })
}
