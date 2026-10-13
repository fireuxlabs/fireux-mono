import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  getCurrentInstance,
  h,
  onScopeDispose,
  ref,
  toValue,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'

const runtime = new URL('../../runtime/', import.meta.url)
const workspace = 'kitchen/components/Workspace/'
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.dev/g, 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const useEditableStringField = load(
  '../../../../core/fireux-core/src/runtime/composables/forms/useEditableStringField.ts',
  'useEditableStringField',
  {
    computed,
    getCurrentInstance,
    ref,
    toValue,
    watch,
    useCommandScope,
    normalizeSlug: (value) => value.toLowerCase().replace(/\W+/g, '-'),
  }
)
const normalizeAllowedWebsites = load(
  'kitchen/utils/allowed-websites.ts',
  'normalizeAllowedWebsites',
  {}
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function network() {
  const requests = [],
    dispatched = []
  const update = async (...args) => {
    const guard = args.pop()
    const request = {
      args: structuredClone(args),
      guard,
      token: deferred(),
      response: deferred(),
    }
    requests.push(request)
    await request.token.promise
    if (!guard())
      throw new Error('The editor changed before this request was sent.')
    dispatched.push(request.args)
    return request.response.promise
  }
  return { update, requests, dispatched }
}
const tick = async () => {
  await Promise.resolve()
  await Promise.resolve()
}
function websiteFixture() {
  const scope = effectScope(),
    transport = network()
  const source = {
    ownerScope: ref(0),
    origins: ref(['https://original.example']),
    outcome: ref('ready'),
    error: ref(''),
    canWrite: ref(true),
    update: transport.update,
  }
  const state = scope.run(() => {
    source.captureIntent = useCommandScope([source.ownerScope])
    return load(
      workspace + 'Integrations/AllowedWebsites.vue',
      '({text,baseline,busy,saveError,saved,changed,save,...source})',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        useKitchenWebsiteOrdering: () => source,
        normalizeAllowedWebsites,
        source,
      }
    )
  })
  return { scope, source, state, ...transport }
}
const offering = (id = 'lunch') => ({
  id,
  name: id,
  enabled: true,
  menu_ids: ['food'],
  hours: {
    timezone: 'Europe/Zurich',
    windows: [{ day: 1, start: '10:00', end: '20:00' }],
  },
  interactions: [
    { type: 'collection', enabled: true },
    { type: 'delivery', enabled: false },
  ],
})
function offeringFixture() {
  const scope = effectScope(),
    transport = network(),
    offeringId = ref('lunch')
  const source = {
    ownerScope: ref(0),
    offerings: ref([offering()]),
    outcome: ref('ready'),
    selectedKitchen: ref({ id: 'venue', identity: { slug: 'venue' } }),
    kitchenId: ref('venue'),
    activeKitchenAppId: ref('app'),
    canWrite: ref(true),
    menus: ref([{ id: 'food', name: 'Food', status: 'published' }]),
    menusPending: ref(false),
    menusOutcome: ref('ready'),
    timezone: ref('Europe/Zurich'),
    update: transport.update,
    updateInteraction: transport.update,
  }
  const state = scope.run(() => {
    source.captureIntent = useCommandScope([source.ownerScope])
    return load(
      workspace + 'Offerings/Single.vue',
      '({updateOffering,updateName,updateEnabled,saveInteraction,captureOfferingIntent,interactionType,offering,setup,busy,error,primaryOptions,otherOptions,interactionState,interaction,...source})',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        useRouteParam: () => offeringId,
        useKitchenOfferings: () => source,
        KitchenOrderTypes: [
          'collection',
          'delivery',
          'pre_order',
          'browse',
          'eat_in',
        ],
        newKitchenOfferingInteraction: (type) => ({ type }),
        kitchenOrderTypeLabel: (type) => type,
        offeringSetupSummary: () => ({
          configured: true,
          canEnable: true,
          checks: [],
        }),
        source,
      }
    )
  })
  return { scope, source, state, offeringId, ...transport }
}
async function render(path, state) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const warnings = []
  const app = createSSRApp({ setup: () => state, render: compile(template) })
  app.config.warnHandler = (warning) => warnings.push(warning)
  const stub = (name) => ({
    name,
    inheritAttrs: false,
    props: {
      entity: String,
      loading: Boolean,
      state: String,
      message: String,
      title: String,
      description: String,
      value: null,
      modelValue: null,
      disabled: Boolean,
    },
    setup:
      (props, { slots }) =>
      () =>
        h('div', [
          name === 'MoleculesStateCard'
            ? `${props.entity}: ${props.loading ? 'loading' : props.state}`
            : name === 'MoleculesCopyError'
              ? `Copy error: ${props.message}`
              : props.title || '',
          ...Object.values(slots).flatMap((slot) => slot()),
        ]),
  })
  for (const name of new Set(
    [...template.matchAll(/<([A-Z][\w]*)\b/g)].map((match) => match[1])
  ))
    app.component(name, stub(name))
  const html = await renderToString(app)
  assert.deepEqual(
    warnings,
    [],
    'native template must compile and render without Vue warnings'
  )
  return html
}

test('website dirty draft survives same-owner live refresh, failure and new stored origins; clean draft follows source', () => {
  const f = websiteFixture()
  assert.equal(f.state.text.value, 'https://original.example')
  f.state.text.value = 'https://draft.example'
  f.source.outcome.value = 'pending'
  f.source.canWrite.value = false
  f.source.origins.value = []
  assert.equal(f.state.text.value, 'https://draft.example')
  f.source.outcome.value = 'error'
  f.source.error.value = 'Read failed'
  assert.equal(f.state.text.value, 'https://draft.example')
  f.source.origins.value = ['https://remote.example']
  f.source.error.value = ''
  f.source.outcome.value = 'ready'
  assert.equal(f.state.baseline.value, 'https://remote.example')
  assert.equal(f.state.text.value, 'https://draft.example')
  f.state.text.value = f.state.baseline.value
  f.source.origins.value = ['https://latest.example']
  assert.equal(f.state.text.value, 'https://latest.example')
  assert.equal(f.state.changed.value, false)
  f.scope.stop()
})
test('website owner lifetime clears unfinished text synchronously even on same-id authority ABA', () => {
  const f = websiteFixture()
  f.state.text.value = 'https://private-draft.example'
  f.source.outcome.value = 'pending'
  f.source.origins.value = []
  f.source.ownerScope.value++
  assert.equal(f.state.text.value, '')
  assert.equal(f.state.baseline.value, '')
  f.source.ownerScope.value++
  assert.equal(f.state.text.value, '')
  f.source.origins.value = ['https://new-owner.example']
  f.source.outcome.value = 'ready'
  assert.equal(f.state.text.value, 'https://new-owner.example')
  f.scope.stop()
})
test('website forwards draft/owner/disposal intent before credentials and rejects round-trip edits', async () => {
  for (const change of ['draft', 'owner', 'dispose']) {
    const f = websiteFixture()
    f.state.text.value = 'https://submitted.example'
    const save = f.state.save()
    const original = f.state.text.value
    if (change === 'draft') {
      f.state.text.value = 'https://other.example'
      f.state.text.value = original
    }
    if (change === 'owner') {
      f.source.outcome.value = 'pending'
      f.source.origins.value = []
      f.source.ownerScope.value++
      f.source.ownerScope.value++
      f.state.text.value = original
    }
    if (change === 'dispose') f.scope.stop()
    f.requests[0].token.resolve('token')
    await save
    assert.equal(f.dispatched.length, 0, change)
    assert.equal(f.state.saved.value, false, change)
    assert.equal(f.state.saveError.value, '', change)
    f.scope.stop()
  }
})
test('website current save survives its own child refresh and marks the normalized original input saved', async () => {
  const f = websiteFixture()
  f.state.text.value = ' https://submitted.example/ \nhttps://submitted.example'
  const save = f.state.save()
  f.requests[0].token.resolve('token')
  await tick()
  assert.deepEqual(f.dispatched, [[['https://submitted.example']]])
  f.source.outcome.value = 'pending'
  f.source.canWrite.value = false
  f.source.origins.value = []
  assert.equal(f.state.busy.value, true)
  f.requests[0].response.resolve({ ok: true })
  await save
  assert.equal(f.state.text.value, 'https://submitted.example')
  assert.equal(f.state.changed.value, false)
  assert.equal(f.state.saved.value, true)
  assert.equal(f.state.busy.value, false)
  f.source.origins.value = ['https://submitted.example']
  f.source.outcome.value = 'ready'
  f.source.canWrite.value = true
  assert.equal(f.state.saved.value, true)
  f.scope.stop()
})
test('website old dispatched completion stays quiet and cannot clear a newer owners active save', async () => {
  const f = websiteFixture()
  f.state.text.value = 'https://old.example'
  const old = f.state.save()
  f.requests[0].token.resolve('token')
  await tick()
  f.source.outcome.value = 'pending'
  f.source.origins.value = []
  f.source.ownerScope.value++
  f.source.origins.value = ['https://new-base.example']
  f.source.outcome.value = 'ready'
  f.state.text.value = 'https://new.example'
  const current = f.state.save()
  f.requests[1].token.resolve('token')
  await tick()
  f.requests[0].response.resolve({ ok: true })
  await old
  assert.equal(f.state.busy.value, true)
  assert.equal(f.state.saved.value, false)
  assert.equal(f.state.text.value, 'https://new.example')
  f.requests[1].response.resolve({ ok: true })
  await current
  assert.equal(f.state.saved.value, true)
  assert.equal(f.state.busy.value, false)
  f.scope.stop()
})
test('website reports only current save failure, and native read states do not claim empty settings while unknown', async () => {
  const f = websiteFixture()
  f.state.text.value = 'https://draft.example'
  const save = f.state.save()
  f.requests[0].token.resolve('token')
  await tick()
  f.requests[0].response.reject(new Error('Save failed'))
  await save
  assert.equal(f.state.saveError.value, 'Save failed')
  let html = await render(
    workspace + 'Integrations/AllowedWebsites.vue',
    f.state
  )
  assert.match(html, /Copy error: Save failed/)
  f.source.outcome.value = 'pending'
  f.source.origins.value = []
  html = await render(workspace + 'Integrations/AllowedWebsites.vue', f.state)
  assert.match(html, /Allowed websites: loading/)
  assert.doesNotMatch(html, /No external websites/)
  f.source.error.value = 'Read failed'
  f.source.outcome.value = 'error'
  html = await render(workspace + 'Integrations/AllowedWebsites.vue', f.state)
  assert.match(html, /Copy error: Read failed/)
  assert.doesNotMatch(html, /No external websites/)
  f.scope.stop()
})
test('Offering interaction choice and parent pending state survive own live record refresh', async () => {
  const f = offeringFixture()
  f.state.interactionType.value = 'delivery'
  const save = f.state.saveInteraction({ message: 'Customer message' })
  f.requests[0].token.resolve('token')
  await tick()
  assert.equal(
    f.requests[0].guard(),
    true,
    'parent busy must not invalidate the submitted child'
  )
  assert.deepEqual(f.dispatched[0], [
    'lunch',
    'delivery',
    { message: 'Customer message' },
  ])
  f.source.outcome.value = 'pending'
  f.source.canWrite.value = false
  f.source.offerings.value = []
  assert.equal(f.state.busy.value, true)
  assert.equal(f.state.interactionType.value, 'delivery')
  f.requests[0].response.resolve({ ok: true })
  await save
  assert.equal(f.state.busy.value, false)
  f.source.offerings.value = [offering()]
  f.source.canWrite.value = true
  f.source.outcome.value = 'ready'
  assert.equal(f.state.interactionType.value, 'delivery')
  const html = await render(workspace + 'Offerings/Single.vue', f.state)
  assert.match(html, /lunch/)
  f.scope.stop()
})
test('Offering route, interaction, authority ABA and disposal cancel before credentials without stale feedback', async () => {
  for (const change of ['route', 'interaction', 'owner', 'dispose']) {
    const f = offeringFixture()
    const save = f.state.updateOffering({ name: 'New name' })
    const rejected = assert.rejects(save, /editor changed/)
    if (change === 'route') {
      f.offeringId.value = 'other'
      f.offeringId.value = 'lunch'
    }
    if (change === 'interaction') {
      f.state.interactionType.value = 'delivery'
      f.state.interactionType.value = 'collection'
    }
    if (change === 'owner') {
      f.source.ownerScope.value++
      f.source.ownerScope.value++
    }
    if (change === 'dispose') f.scope.stop()
    f.requests[0].token.resolve('token')
    await rejected
    assert.equal(f.dispatched.length, 0, change)
    assert.equal(f.state.error.value, '', change)
    f.scope.stop()
  }
})
test('actual Core string editor cancellation reaches Offering name command before credentials', async () => {
  const f = offeringFixture()
  const field = f.scope.run(() =>
    useEditableStringField({
      value: () => f.state.offering.value?.name,
      disabled: () => f.state.busy.value || !f.source.canWrite.value,
      captureIntent: f.state.captureOfferingIntent,
      update: f.state.updateName,
    })
  )
  field.startEditing()
  field.draft.value = 'Changed name'
  const save = field.save()
  assert.equal(
    f.requests[0].guard(),
    true,
    'parent busy cannot self-invalidate real Core editor'
  )
  field.cancel()
  f.requests[0].token.resolve('token')
  await save
  assert.equal(f.dispatched.length, 0)
  assert.equal(field.errorMessage.value, '')
  assert.equal(f.state.error.value, '')
  f.scope.stop()
})
test('Offering stale dispatched finally cannot clear a newer route save', async () => {
  const f = offeringFixture()
  const old = f.state.updateOffering({ name: 'First' })
  f.requests[0].token.resolve('token')
  await tick()
  f.offeringId.value = 'other'
  f.source.offerings.value = [offering('other')]
  const current = f.state.updateOffering({ name: 'Second' })
  f.requests[1].token.resolve('token')
  await tick()
  f.requests[0].response.reject(new Error('Old failure'))
  await assert.rejects(old, /Old failure/)
  assert.equal(f.state.busy.value, true)
  assert.equal(f.state.error.value, '')
  f.requests[1].response.resolve({ ok: true })
  await current
  assert.equal(f.state.busy.value, false)
  f.scope.stop()
})

function adapter(name, names, props, deps = {}) {
  return load(workspace + `Offerings/${name}.vue`, `({${names}})`, {
    computed,
    defineProps: () => props,
    withDefaults: (value) => value,
    ...deps,
  })
}
