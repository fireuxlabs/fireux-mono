import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
  createSSRApp,
  compile,
  h,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'

function load(path, result, dependencies, component = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (component)
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function readTemplate(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  return source.slice(
    source.indexOf('<template>') + '<template>'.length,
    source.lastIndexOf('</template>')
  )
}
function compileTemplate(template) {
  return compile(template, {
    onError: (error) => {
      throw error
    },
    onWarn: (warning) => {
      throw warning
    },
  })
}
async function settlePromises() {
  for (let i = 0; i < 12; i++) await Promise.resolve()
}
async function waitForCalls(fixture, count) {
  for (let i = 0; i < 12 && fixture.calls.length < count; i++)
    await Promise.resolve()
  assert.equal(fixture.calls.length, count, 'expected provider dispatch')
}
const useIdentity = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/useIdentity.ts',
  'useIdentity',
  { computed }
)
const placeModel = load(
  '../../../fireux-places/src/runtime/place/models/identity-edit.ts',
  '({readPlaceIdentity,identityDraft,placeIdentityPatch,placeIdentityFields})',
  {}
)

test('Kitchen Identity preserves Kitchen absence and gives either source failure precedence over loading', () => {
  const state = {
    kitchenId: ref('kitchen'),
    placeId: ref('kitchen'),
    outcome: ref('ready'),
    pending: ref(false),
    placeOutcome: ref('ready'),
    place: ref({ id: 'kitchen', name: 'Venue' }),
    canWrite: ref(true),
  }
  const api = load(
    '../runtime/kitchen/composables/workspace/identity/useKitchenIdentity.ts',
    'useKitchenIdentity',
    {
      useIdentity,
      computed,
      watchEffect: (fn) => fn(),
      useKitchenWorkspacePlace: () => state,
      useFireUXConfig: () => ({ appId: 'app' }),
      ...placeModel,
      kitchenIdentityPurpose: 'Identity',
      kitchenIdentityBoundary: 'Place owns venue data',
      useWorkspacePageState: () => ({ publish() {} }),
    }
  )()
  assert.equal(api.status.value, 'ready')
  for (const outcome of ['idle', 'empty']) {
    state.outcome.value = outcome
    assert.equal(api.status.value, 'empty')
    state.placeOutcome.value = 'error'
    assert.equal(api.status.value, 'empty')
    state.placeOutcome.value = 'ready'
  }
  state.outcome.value = 'ready'
  state.kitchenId.value = ''
  state.placeOutcome.value = 'error'
  assert.equal(api.status.value, 'empty')
  state.kitchenId.value = 'kitchen'
  state.placeOutcome.value = 'ready'
  state.outcome.value = 'missing'
  assert.equal(api.status.value, 'missing')
  assert.equal(api.canWrite.value, false)
  state.outcome.value = 'pending'
  state.placeOutcome.value = 'error'
  assert.equal(api.status.value, 'error')
  state.outcome.value = 'error'
  state.placeOutcome.value = 'pending'
  state.pending.value = true
  assert.equal(api.status.value, 'error')
  state.outcome.value = 'ready'
  state.placeOutcome.value = 'pending'
  assert.equal(api.status.value, 'pending')
  state.pending.value = false
  state.placeOutcome.value = 'ready'
  assert.equal(api.status.value, 'ready')
})

test('Kitchen linked Place hides retained failed or pending data and accepts only the current ready id', () => {
  const state = {
    place: ref({ id: 'kitchen-a', name: 'Retained' }),
    outcome: ref('ready'),
    pending: ref(false),
  }
  const identity = { kitchenId: ref('kitchen-a'), outcome: ref('ready') }
  const api = load(
    '../runtime/kitchen/composables/workspace/identity/useKitchenWorkspacePlace.ts',
    'useKitchenWorkspacePlace',
    {
      computed,
      useKitchenWorkspaceIdentity: () => identity,
      usePlaceFetch: () => state,
      readPlaceCurrencyCode: (place) => (place ? 'CHF' : ''),
    }
  )(identity)
  assert.equal(api.place.value.name, 'Retained')
  for (const outcome of ['error', 'pending', 'missing', 'idle']) {
    state.outcome.value = outcome
    assert.equal(api.place.value, null)
    assert.equal(api.currencyCode.value, '')
  }
  state.outcome.value = 'ready'
  identity.outcome.value = 'error'
  assert.equal(api.place.value, null)
  identity.outcome.value = 'pending'
  assert.equal(api.place.value, null)
  identity.outcome.value = 'ready'
  identity.kitchenId.value = 'kitchen-b'
  assert.equal(api.place.value, null)
  state.place.value = { id: 'kitchen-b', name: 'Current' }
  assert.equal(api.place.value.name, 'Current')
})

test('Venue profile renders failures rather than missing records or retained editors', async () => {
  const template = readTemplate(
    '../runtime/kitchen/components/Workspace/Identity/Profile.vue'
  )
  const app = createSSRApp({
    setup: () => ({
      identity: {
        status: ref('error'),
        fields: ref({}),
        selectedKitchen: ref(null),
        place: ref({ id: 'kitchen', name: 'Retained venue' }),
        placeId: ref('kitchen'),
        canWrite: ref(false),
        canWriteKitchen: ref(false),
        mutationAuthority: ref({}),
      },
      workspaceEntryPath: '/',
      publicTo: '',
      section: null,
      sectionTitle: '',
      debug: {},
    }),
    render: compileTemplate(template),
  })
  app.component('MoleculesStateCard', {
    props: ['state'],
    setup: (props) => () =>
      h('p', props.state === 'error' ? 'Read failed' : 'Loading'),
  })
  app.component('UAlert', {
    props: ['title'],
    setup: (props) => () => h('p', props.title),
  })
  app.component('PlaceEdit', { render: () => h('form', 'Venue editor') })
  for (const name of [
    'USkeleton',
    'MoleculesCopyError',
    'UIcon',
    'PlaceEditGoogleReview',
    'UCard',
  ])
    app.component(name, { render: () => null })
  app.component('PlaceEditIdentity', { render: () => null })
  app.component('UBreadcrumb', { render: () => null })
  app.component('USlideover', { render: () => null })
  app.component('ClientOnly', { render: () => null })
  app.component('DevDebugPanel', { render: () => null })
  app.component('UButton', { render: () => h('button') })
  const html = await renderToString(app)
  assert.ok(html.includes('Venue details unavailable'))
  assert.ok(!html.includes('Place record missing'))
  assert.ok(!html.includes('Venue editor'))
  assert.ok(!html.includes('Retained venue'))
})

function aiFixture() {
  const credentials = deferred(),
    responses = [],
    calls = [],
    emitted = []
  const currentUser = ref({
    uid: 'actor',
    getIdToken: () => credentials.promise,
  })
  const session = {
    appUser: ref({ role: 'admin' }),
    pending: ref(false),
    error: ref(null),
  }
  const config = reactive({ appId: 'app' }),
    route = reactive({ fullPath: '/workspace/kitchen/identity' })
  const id = ref('kitchen'),
    fields = ref({ name: 'Original venue', tagline: 'Original tagline' }),
    status = ref('ready'),
    write = ref(true)
  const identity = {
    ...useIdentity({ id, fields, status, canWrite: write }),
    fields,
    kitchenId: id,
  }
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../runtime/kitchen/components/Workspace/Identity/AI.vue',
      '({submit,prompt,message,submitting})',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        onBeforeUnmount: (fn) => onScopeDispose(fn),
        defineProps: () => ({ identity }),
        defineEmits:
          () =>
          (...args) =>
            emitted.push(args),
        useAuth: () => ({ currentUser }),
        useAppSession: () => session,
        useFireUXConfig: () => config,
        useRoute: () => route,
        useRequireUser: async () => currentUser.value,
        $fetch: (url, options) => {
          const response = deferred()
          responses.push(response)
          calls.push({ url, options })
          return response.promise
        },
      },
      true
    )
  )
  api.prompt.value = 'Original request'
  return {
    owner,
    api,
    credentials,
    responses,
    calls,
    emitted,
    currentUser,
    session,
    config,
    route,
    id,
    fields,
    status,
    write,
  }
}
function roundTrip(h, kind) {
  if (kind === 'account') {
    const actor = h.currentUser.value
    h.currentUser.value = { ...actor, uid: 'other' }
    h.currentUser.value = actor
  } else if (kind === 'app') {
    h.config.appId = 'other'
    h.config.appId = 'app'
  } else if (kind === 'membership') {
    const member = h.session.appUser.value
    h.session.appUser.value = null
    h.session.appUser.value = member
  } else if (kind === 'selection') {
    h.id.value = 'other'
    h.id.value = 'kitchen'
  } else if (kind === 'fields') {
    h.fields.value.tagline = 'Changed'
    h.fields.value.tagline = 'Original tagline'
  } else if (kind === 'actions') {
    h.write.value = false
    h.write.value = true
  } else if (kind === 'failure') {
    h.session.error.value = new Error('Read failed')
    h.session.error.value = null
  } else if (kind === 'route') {
    h.route.fullPath = '/elsewhere'
    h.route.fullPath = '/workspace/kitchen/identity'
  } else h.owner.stop()
}
const intent = {
  action: 'update',
  fields: { tagline: 'Prepared' },
  message: '',
}
for (const kind of [
  'account',
  'app',
  'membership',
  'selection',
  'fields',
  'actions',
  'failure',
  'route',
  'disposed',
]) {
  test(`Kitchen Identity AI stops ${kind} round trips before credential dispatch`, async () => {
    const h = aiFixture(),
      flight = h.api.submit()
    await Promise.resolve()
    roundTrip(h, kind)
    h.credentials.resolve('token')
    await settlePromises()
    for (const response of h.responses) response.resolve(intent)
    await flight
    assert.equal(h.calls.length, 0)
    assert.deepEqual(h.emitted, [])
    h.owner.stop()
  })
  test(`Kitchen Identity AI rejects ${kind} completion after provider dispatch`, async () => {
    const h = aiFixture()
    h.credentials.resolve('token')
    const flight = h.api.submit()
    await waitForCalls(h, 1)
    roundTrip(h, kind)
    h.responses[0].resolve(intent)
    await flight
    assert.deepEqual(h.emitted, [])
    h.owner.stop()
  })
}
test('Kitchen Identity AI snapshots its original prompt before credentials and preserves human confirmation', async () => {
  const h = aiFixture(),
    flight = h.api.submit()
  h.api.prompt.value = 'Typed while waiting'
  h.credentials.resolve('token')
  await waitForCalls(h, 1)
  assert.deepEqual(h.calls[0].options.body, {
    prompt: 'Original request',
    identity: { name: 'Original venue', tagline: 'Original tagline' },
    availableActions: ['read', 'update'],
  })
  h.responses[0].resolve(intent)
  await flight
  assert.deepEqual(h.emitted, [['action', intent]])
  assert.ok(h.api.message.value.includes('Nothing has been saved'))
  h.owner.stop()
})
for (const completion of ['success', 'error'])
  test(`Kitchen Identity AI old ${completion} cannot clear a new request`, async () => {
    const h = aiFixture()
    h.credentials.resolve('token')
    const first = h.api.submit()
    await waitForCalls(h, 1)
    roundTrip(h, 'selection')
    const second = h.api.submit()
    await waitForCalls(h, 2)
    if (completion === 'success') h.responses[0].resolve(intent)
    else h.responses[0].reject(new Error('Old failure'))
    await first
    assert.equal(h.api.submitting.value, true)
    assert.equal(h.api.message.value, '')
    assert.deepEqual(h.emitted, [])
    h.responses[1].resolve(intent)
    await second
    assert.equal(h.api.submitting.value, false)
    assert.deepEqual(h.emitted, [['action', intent]])
    h.owner.stop()
  })

function editorFixture() {
  const props = reactive({
    place: { id: 'venue', name: 'Original venue' },
    canWrite: true,
    mutationAuthority: { appId: 'app', kitchenId: 'kitchen' },
  })
  const currentUser = ref({ uid: 'actor' }),
    appId = ref('app'),
    membership = ref({ role: 'admin' }),
    calls = [],
    emitted = []
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../../../fireux-places/src/runtime/place/components/Edit/Identity.vue',
      '({show,save,open,saving,error,draft})',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        useCommandScope,
        ...placeModel,
        defineProps: () => props,
        defineEmits:
          () =>
          (...args) =>
            emitted.push(args),
        defineExpose() {},
        useAuth: () => ({ currentUser }),
        usePlaceUpdate: () => ({
          captureIntent: useCommandScope([currentUser, appId, membership]),
          updateIdentity: (patch, context) => {
            const response = deferred()
            calls.push({ patch, context, response })
            return response.promise
          },
        }),
      },
      true
    )
  )
  api.show({ name: 'First edit' })
  return { props, currentUser, appId, membership, calls, emitted, owner, api }
}
function invalidateEditor(h, kind) {
  if (kind === 'account') {
    h.currentUser.value = { uid: 'other' }
    h.currentUser.value = { uid: 'actor' }
  } else if (kind === 'membership') {
    const value = h.membership.value
    h.membership.value = null
    h.membership.value = value
  } else if (kind === 'selection') {
    h.props.place = { id: 'other', name: 'Other venue' }
    h.props.place = { id: 'venue', name: 'Original venue' }
  } else if (kind === 'authority') {
    h.props.mutationAuthority.kitchenId = 'other'
    h.props.mutationAuthority.kitchenId = 'kitchen'
  } else if (kind === 'revoked') {
    h.props.canWrite = false
    h.props.canWrite = true
  } else h.owner.stop()
}
for (const kind of [
  'account',
  'membership',
  'selection',
  'authority',
  'revoked',
  'disposed',
])
  for (const completion of ['success', 'error'])
    test(`Place Identity editor rejects ${completion} feedback after ${kind} changes`, async () => {
      const h = editorFixture(),
        flight = h.api.save()
      assert.equal(h.calls.length, 1)
      assert.deepEqual(h.calls[0].patch, { name: 'First edit' })
      assert.deepEqual(h.calls[0].context, { id: 'venue' })
      invalidateEditor(h, kind)
      if (kind !== 'disposed') h.api.show({ name: 'New edit' })
      if (completion === 'success') h.calls[0].response.resolve({ id: 'venue' })
      else h.calls[0].response.reject(new Error('Old failure'))
      await flight
      assert.deepEqual(h.emitted, [])
      assert.equal(h.api.error.value, '')
      assert.equal(h.api.saving.value, false)
      if (kind !== 'disposed') {
        assert.equal(h.api.open.value, true)
        assert.equal(h.api.draft.value.name, 'New edit')
      }
      h.owner.stop()
    })
test('Place Identity preserves newer editor state and still completes a current committed update', async () => {
  const h = editorFixture(),
    first = h.api.save()
  h.api.open.value = false
  h.api.show({ name: 'Second edit' })
  const second = h.api.save()
  assert.equal(h.calls.length, 2)
  h.calls[0].response.resolve({ id: 'venue' })
  await first
  assert.equal(h.api.open.value, true)
  assert.equal(h.api.saving.value, true)
  assert.equal(h.api.draft.value.name, 'Second edit')
  assert.deepEqual(h.emitted, [])
  h.props.place.name = 'Second edit'
  h.calls[1].response.resolve({ id: 'venue' })
  await second
  assert.equal(h.api.open.value, false)
  assert.equal(h.api.saving.value, false)
  assert.deepEqual(h.emitted, [['saved']])
  h.owner.stop()
})
test('Place Identity still rejects live field conflicts before dispatch and exposes a current command failure', async () => {
  const h = editorFixture()
  h.props.place.name = 'Changed externally'
  await h.api.save()
  assert.equal(h.calls.length, 0)
  assert.match(h.api.error.value, /details changed/)
  h.api.show({ name: 'Reviewed edit' })
  const flight = h.api.save()
  h.calls[0].response.reject(new Error('Current failure'))
  await flight
  assert.equal(h.api.open.value, true)
  assert.equal(h.api.saving.value, false)
  assert.equal(h.api.error.value, 'Current failure')
  h.owner.stop()
})

test('Place Identity disables every editable field during a pending save', async () => {
  const template = readTemplate(
    '../../../fireux-places/src/runtime/place/components/Edit/Identity.vue'
  )
  const app = createSSRApp({
    setup: () => ({
      open: true,
      saving: true,
      error: '',
      canWrite: true,
      dirty: true,
      draft: placeModel.readPlaceIdentity(null),
      placeIdentityFields: placeModel.placeIdentityFields,
      save() {},
    }),
    render: compileTemplate(template),
  })
  app.component('UModal', {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.body?.()),
  })
  app.component('UFormField', {
    setup:
      (_, { slots }) =>
      () =>
        h('label', slots.default?.()),
  })
  app.component('UInput', {
    props: ['disabled'],
    setup: (props) => () => h('input', { disabled: props.disabled }),
  })
  app.component('UButton', {
    props: ['disabled'],
    setup: (props) => () => h('button', { disabled: props.disabled }),
  })
  app.component('UAlert', { render: () => null })
  app.component('MoleculesCopyError', { render: () => null })
  const html = await renderToString(app)
  const inputs = html.match(/<input[^>]*>/g) || []
  assert.equal(inputs.length, placeModel.placeIdentityFields.length)
  assert.ok(inputs.every((input) => input.includes(' disabled')))
})
