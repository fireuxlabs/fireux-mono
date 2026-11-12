import assert from 'node:assert/strict'
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
  compile,
  createSSRApp,
  h,
  nextTick,
  shallowReactive,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import test from 'node:test'
import { useIdentityEditor } from '../../../../../core/fireux-core/src/runtime/composables/fireux/useIdentityEditor.ts'
import { useWorkspaceIdentity } from '../../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceIdentity.ts'
import { normalizeString } from '../../../../../core/fireux-core/src/runtime/utils/normalize-string.ts'
import { normalizeSlug } from '../../../../../core/fireux-core/src/runtime/utils/slug/normalize-slug.ts'
import { readPlaceCurrencyCode } from '../../../../fireux-places/src/runtime/place/utils/place-spine.ts'
import {
  readPlaceIdentity,
  placeIdentityFields,
} from '../../../../fireux-places/src/runtime/place/models/identity-edit.ts'
import {
  kitchenIdentityPurpose,
  kitchenIdentityBoundary,
} from '../../runtime/kitchen/models/identity-intent.ts'

const runtime = new URL('../../runtime/', import.meta.url)
function load(path, expression, deps) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const commandSource = readFileSync(
  new URL(
    '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(commandSource)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)
const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

async function listingHarness({
  initialOpen = false,
  missingPlace = false,
  kitchenId = 'a',
  storedSlug = 'original',
  reviewed = true,
  mountEditor = true,
} = {}) {
  const scope = effectScope()
  const token = deferred(),
    response = deferred(),
    laterToken = deferred(),
    laterResponse = deferred(),
    calls = [],
    events = []
  let credentials = 0,
    workspaceReads = 0
  const currentUser = ref({
    uid: 'alice',
    getIdToken: () =>
      ++credentials === 1 ? token.promise : laterToken.promise,
  })
  const session = {
    appUser: ref({ role: 'user', subscription: 'free' }),
  }
  const root = ref({
    id: kitchenId,
    identity: { slug: storedSlug, status: 'active', visibility: true },
  })
  const outcome = ref('ready')
  const workspace = {
    id: ref(kitchenId),
    root,
    outcome,
    data: computed(() =>
      root.value && outcome.value === 'ready'
        ? { ...root.value, presentation: { display_name: 'Supplied Kitchen' } }
        : null
    ),
    place: ref(missingPlace ? null : { id: kitchenId, name: 'Venue A' }),
    placeOutcome: ref(missingPlace ? 'empty' : 'ready'),
  }
  const updater = scope.run(() =>
    load('kitchen/composables/useKitchenUpdate.ts', 'useKitchenUpdate()', {
      useAuth: () => ({ currentUser }),
      useAppSession: () => session,
      useFireUXConfig: () => ({ appId: 'app' }),
      useRoute: () => ({ path: '/workspace/kitchen/identity' }),
      useRuntimeConfig: () => ({ public: {} }),
      useCommandScope,
      useRequireUser: async () => currentUser.value,
      refreshNuxtData: async () => {},
      $fetch: async (url, options) => {
        calls.push({ url, options })
        return calls.length === 1 ? response.promise : laterResponse.promise
      },
    })
  )
  const useKitchenIdentityProjection = load(
    'kitchen/composables/useKitchenIdentity.ts',
    'useKitchenIdentityProjection',
    { computed, normalizeString, readPlaceCurrencyCode }
  )
  const identity = scope.run(() =>
    load(
      'kitchen/composables/workspace/useKitchenWorkspaceIdentity.ts',
      'useKitchenWorkspaceIdentity()',
      {
        computed,
        useWorkspaceIdentity,
        useKitchenIdentityProjection,
        useKitchenWorkspace: () => {
          workspaceReads++
          return workspace
        },
        useKitchenUpdate: () => updater,
        useAuth: () => ({ currentUser }),
        useFireUXConfig: () => ({ appId: 'app' }),
        readPlaceIdentity,
        placeIdentityFields,
        kitchenIdentityPurpose,
        kitchenIdentityBoundary,
      }
    )
  )
  const props = shallowReactive({ open: initialOpen, identity })
  const createEditor = (supplied, emit) =>
    scope.run(() =>
      load(
        'kitchen/components/Identity/ListingEdit.vue',
        '({save,draft,canSave,saving,updateError})',
        {
          computed,
          useIdentityEditor,
          normalizeSlug,
          defineProps: () => supplied,
          defineEmits: () => emit,
          useAuth: () => ({ currentUser }),
        }
      )
    )
  const editor = mountEditor
    ? createEditor(props, (...event) => {
        events.push(event)
        if (event[0] === 'update:open') props.open = event[1]
      })
    : undefined
  if (mountEditor && !initialOpen) props.open = true
  await nextTick()
  if (mountEditor && reviewed) editor.draft.value.slug = 'reviewed'
  return {
    scope,
    token,
    response,
    laterToken,
    laterResponse,
    calls,
    events,
    props,
    workspace,
    identity,
    currentUser,
    session,
    workspaceReads: () => workspaceReads,
    createEditor,
    editor,
  }
}

for (const change of [
  'none',
  'closed',
  'reopened',
  'slug',
  'status',
  'visibility',
  'Kitchen ABA',
  'account ABA',
  'authority ABA',
  'root ABA',
  'source ABA',
  'membership ABA',
  'disposal',
]) {
  test(`listing preparation respects the captured editor through credentials: ${change}`, async () => {
    const h = await listingHarness()
    const pending = h.editor.save()
    await nextTick()
    if (change === 'closed') h.props.open = false
    if (change === 'reopened') {
      h.props.open = false
      h.props.open = true
    }
    if (change === 'slug') h.editor.draft.value.slug = 'new draft'
    if (change === 'status') h.editor.draft.value.status = 'inactive'
    if (change === 'visibility') h.editor.draft.value.visibility = false
    if (change === 'Kitchen ABA') {
      h.workspace.id.value = 'b'
      h.workspace.id.value = 'a'
    }
    if (change === 'account ABA' || change === 'authority ABA') {
      const previous = h.currentUser.value
      h.currentUser.value = change === 'account ABA' ? { uid: 'bob' } : null
      h.currentUser.value = previous
    }
    if (change === 'root ABA') {
      const previous = h.workspace.root.value
      h.workspace.root.value = null
      h.workspace.root.value = previous
    }
    if (change === 'source ABA') {
      h.workspace.data.value.identity.slug = 'other-source'
      h.workspace.data.value.identity.slug = 'original'
    }
    if (change === 'membership ABA') {
      const previous = h.session.appUser.value
      h.session.appUser.value = { role: 'user', subscription: 'pro' }
      h.session.appUser.value = previous
    }
    if (change === 'disposal') h.scope.stop()
    const priorEvents = [...h.events]
    h.token.resolve('token')
    h.response.resolve({ ok: true, kitchen_id: 'a' })
    await pending
    assert.equal(h.editor.saving.value, false)
    if (change === 'none') {
      assert.equal(h.calls.length, 1)
      assert.equal(h.calls[0].url, '/api/workspace/kitchen/update')
      assert.deepEqual(h.calls[0].options.body, {
        kitchen_id: 'a',
        patch: {
          'identity.slug': 'reviewed',
          'identity.status': 'active',
          'identity.visibility': true,
        },
      })
      assert.deepEqual(h.events, [['update:open', false]])
      assert.equal(h.props.open, false)
    } else {
      assert.deepEqual(
        h.calls,
        [],
        'obsolete preparation never dispatches a root edit'
      )
      assert.deepEqual(
        h.events,
        priorEvents,
        'obsolete completion emits no new dialog action'
      )
    }
    h.scope.stop()
  })
}

test('an initially open controlled listing uses the supplied Identity without acquiring another Workspace', async () => {
  const h = await listingHarness({
    initialOpen: true,
    kitchenId: 'supplied',
    reviewed: false,
  })
  assert.equal(
    h.workspaceReads(),
    1,
    'only the owning Identity controller acquires Workspace state'
  )
  assert.equal(h.editor.draft.value.kitchenId, 'supplied')
  assert.equal(h.editor.draft.value.slug, 'original')
  h.editor.draft.value.status = 'archived'
  const pending = h.editor.save()
  await nextTick()
  h.token.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'supplied' })
  await pending
  assert.equal(h.calls[0].options.body.kitchen_id, 'supplied')
  assert.equal(h.calls[0].options.body.patch['identity.status'], 'archived')
  assert.equal(h.props.open, false)
  h.scope.stop()
})

test('unchanged and reverted listings do not submit or overwrite a different saved URL', async () => {
  const h = await listingHarness({ reviewed: false })
  h.token.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  assert.equal(h.editor.canSave.value, false)
  h.editor.draft.value.slug = ' ORIGINAL '
  assert.equal(h.editor.canSave.value, false)
  await h.editor.save()
  h.editor.draft.value.visibility = false
  assert.equal(h.editor.canSave.value, true)
  h.editor.draft.value.visibility = true
  h.workspace.root.value.identity.slug = 'another-name'
  assert.equal(h.editor.canSave.value, false)
  await h.editor.save()
  h.editor.draft.value.slug = 'another-name'
  assert.equal(
    h.editor.canSave.value,
    false,
    'already matches the saved listing'
  )
  await h.editor.save()
  assert.equal(h.calls.length, 0)
  assert.equal(h.props.open, true)
  h.scope.stop()
})

test('an explicit save can still normalize a historical listing URL', async () => {
  const h = await listingHarness({
    reviewed: false,
    storedSlug: 'Älpha Kitchen',
  })
  assert.equal(h.editor.canSave.value, true)
  const pending = h.editor.save()
  h.token.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await pending
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].options.body.patch['identity.slug'], 'Älpha Kitchen')
  assert.equal(h.props.open, false)
  h.scope.stop()
})

for (const echoFirst of [true, false]) {
  test(`returning to the opening URL during a save allows restoring it after the ${echoFirst ? 'listener' : 'response'} arrives first`, async () => {
    const h = await listingHarness()
    const first = h.editor.save()
    h.token.resolve('token')
    await nextTick()
    await nextTick()
    assert.equal(h.calls.length, 1)
    h.editor.draft.value.slug = 'original'
    if (echoFirst) h.workspace.root.value.identity.slug = 'reviewed'
    h.response.resolve({ ok: true, kitchen_id: 'a' })
    await first
    if (!echoFirst) h.workspace.root.value.identity.slug = 'reviewed'
    assert.equal(h.props.open, true)
    assert.equal(h.editor.canSave.value, true)
    const restore = h.editor.save()
    h.laterToken.resolve('token')
    h.laterResponse.resolve({ ok: true, kitchen_id: 'a' })
    await restore
    assert.equal(h.calls.length, 2)
    assert.equal(h.calls[1].options.body.patch['identity.slug'], 'original')
    assert.equal(h.props.open, false)
    h.scope.stop()
  })
}

test('missing Place identity does not disable a granted root listing edit', async () => {
  const h = await listingHarness({ initialOpen: true, missingPlace: true })
  assert.equal(h.identity.status.value, 'empty')
  assert.equal(h.identity.canWrite.value, false)
  assert.equal(h.identity.canWriteKitchen.value, true)
  assert.equal(h.props.open, true)
  const pending = h.editor.save()
  await nextTick()
  h.token.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await pending
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].options.body.kitchen_id, 'a')
  assert.equal(h.props.open, false)
  h.scope.stop()
})

test('a venue read failure during a listing edit preserves the authorised draft and save', async () => {
  const h = await listingHarness({ kitchenId: 'selected' })
  const pending = h.editor.save()
  for (const phase of ['pending', 'error']) {
    h.workspace.placeOutcome.value = phase
    h.workspace.outcome.value = phase
    assert.equal(h.identity.selectedKitchen.value, null)
    assert.equal(h.identity.canWrite.value, false)
    assert.equal(h.identity.canWriteKitchen.value, true)
    assert.equal(h.props.open, true)
    assert.equal(h.editor.draft.value.slug, 'reviewed')
  }
  h.token.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'selected' })
  await pending
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].options.body.kitchen_id, 'selected')
  assert.equal(h.calls[0].options.body.patch['identity.slug'], 'reviewed')
  assert.equal(h.props.open, false)
  h.scope.stop()
})

test('the Identity controller keeps its changes-first API and forwards the optional surface predicate', async () => {
  const h = await listingHarness()
  const pending = h.identity.update(
    { 'identity.visibility': false },
    () => false
  )
  h.token.resolve('token')
  await assert.rejects(pending, /context changed/)
  assert.deepEqual(h.calls, [])
  const retry = h.identity.update({ 'identity.visibility': false })
  h.laterToken.resolve('token')
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await retry
  assert.deepEqual(h.calls[0].options.body, {
    kitchen_id: 'a',
    patch: { 'identity.visibility': false },
  })
  h.scope.stop()
})

test('the canonical echo of this listing write preserves its completion', async () => {
  const h = await listingHarness()
  h.editor.draft.value.slug = '  Älpha Kitchen  '
  const pending = h.editor.save()
  await nextTick()
  h.token.resolve('token')
  await nextTick()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].options.body.patch['identity.slug'], 'Älpha Kitchen')
  h.workspace.data.value.identity.slug = 'aelpha-kitchen'
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await pending
  assert.equal(h.editor.updateError.value, '')
  assert.equal(h.editor.saving.value, false)
  assert.equal(h.props.open, false)
  assert.deepEqual(h.events, [['update:open', false]])
  h.scope.stop()
})

test('Home Single opens the supplied root listing and receives its controlled close', async () => {
  const fixture = await listingHarness({
    mountEditor: false,
    missingPlace: true,
  })
  const props = shallowReactive({
    selected: fixture.workspace.data.value,
    identity: fixture.identity,
  })
  const source = readFileSync(
    new URL('kitchen/components/Workspace/Home/Single.vue', runtime),
    'utf8'
  )
  let home, dialog
  const app = createSSRApp({
    setup: () => {
      home = fixture.scope.run(() =>
        load(
          'kitchen/components/Workspace/Home/Single.vue',
          '({editOpen,openEdit})',
          { ref, defineProps: () => props, defineExpose: () => {} }
        )
      )
      home.openEdit()
      return { ...home, ...props, kitchenWorkspaceAvatar: () => ({}) }
    },
    render: compile(
      source.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
    ),
  })
  app.component('WorkspaceSingleCard', { render: () => null })
  app.component('UAvatar', { render: () => null })
  app.component('KitchenIdentityListingEdit', {
    props: ['identity', 'open'],
    setup: (supplied, { emit }) => {
      assert.equal(supplied.identity, fixture.identity)
      assert.equal(supplied.open, true)
      dialog = fixture.createEditor(supplied, emit)
      return () => null
    },
  })
  await renderToString(app)
  assert.equal(home.editOpen.value, true)
  assert.equal(dialog.draft.value.kitchenId, 'a')
  assert.equal(
    fixture.identity.canWrite.value,
    false,
    'the venue editor is unavailable'
  )
  dialog.draft.value.slug = 'home-reviewed'
  const pending = dialog.save()
  await nextTick()
  fixture.token.resolve('token')
  fixture.response.resolve({ ok: true, kitchen_id: 'a' })
  await pending
  assert.equal(
    fixture.calls[0].options.body.patch['identity.slug'],
    'home-reviewed'
  )
  assert.equal(home.editOpen.value, false)
  assert.equal(fixture.workspaceReads(), 1)
  fixture.scope.stop()
})

test('a dispatched listing update retains its result while a closed editor gets no completion', async () => {
  const h = await listingHarness()
  const pending = h.editor.save()
  await nextTick()
  h.token.resolve('token')
  await nextTick()
  assert.equal(h.calls.length, 1)
  h.props.open = false
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await pending
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.events, [])
  h.scope.stop()
})

for (const dispatched of [false, true]) {
  test(`a changed listing draft can be saved again after its ${dispatched ? 'dispatched' : 'preparing'} attempt finishes`, async () => {
    const h = await listingHarness()
    const pending = h.editor.save()
    await nextTick()
    if (dispatched) {
      h.token.resolve('token')
      await nextTick()
      assert.equal(h.calls.length, 1)
    }
    h.editor.draft.value.slug = 'replacement'
    h.token.resolve('token')
    h.response.resolve({ ok: true, kitchen_id: 'a' })
    await pending
    assert.equal(h.editor.saving.value, false)
    const retry = h.editor.save()
    await nextTick()
    h.laterToken.resolve('token')
    h.laterResponse.resolve({ ok: true, kitchen_id: 'a' })
    await retry
    assert.equal(h.calls.length, dispatched ? 2 : 1)
    assert.equal(
      h.calls.at(-1).options.body.patch['identity.slug'],
      'replacement'
    )
    assert.equal(h.editor.saving.value, false)
    h.scope.stop()
  })
}

test('an old listing result cannot release a reopened editor newer save', async () => {
  const h = await listingHarness()
  const old = h.editor.save()
  await nextTick()
  h.token.resolve('token')
  await nextTick()
  assert.equal(h.calls.length, 1)
  h.props.open = false
  h.props.open = true
  h.editor.draft.value.slug = 'newer'
  const newer = h.editor.save()
  await nextTick()
  h.laterToken.resolve('token')
  await nextTick()
  assert.equal(h.calls.length, 2)
  h.response.resolve({ ok: true, kitchen_id: 'a' })
  await old
  assert.equal(h.editor.saving.value, true)
  assert.deepEqual(h.events, [])
  h.laterResponse.resolve({ ok: true, kitchen_id: 'a' })
  await newer
  assert.equal(h.editor.saving.value, false)
  assert.deepEqual(h.events, [['update:open', false]])
  h.scope.stop()
})

for (const change of [
  'Kitchen ABA',
  'authority ABA',
  'account ABA',
  'disposal',
]) {
  test(`publication ignores obsolete feedback after ${change}`, async () => {
    const scope = effectScope(),
      first = deferred(),
      second = deferred(),
      feedback = [],
      calls = []
    const props = reactive({
      kitchen: { identity: { slug: 'first', visibility: false } },
      kitchenId: 'a',
      canWrite: true,
    })
    const account = ref('alice')
    let next = first
    const ui = scope.run(() => {
      const captureIntent = useCommandScope([() => props.kitchenId, account])
      return load(
        'kitchen/components/Edit/Publication.vue',
        '({togglePublication,saving})',
        {
          computed,
          ref,
          watch,
          useCommandScope,
          defineProps: () => props,
          readKitchenVisibility: (k) => k.identity.visibility,
          useToastify: () => ({
            success: (message) => feedback.push(message),
            error: (message) => feedback.push(message),
          }),
          useKitchenUpdate: () => ({
            captureIntent,
            publishKitchen: async (input) => {
              calls.push(input)
              return next.promise
            },
            unpublishKitchen: async () => {
              throw new Error('unexpected')
            },
          }),
        }
      )
    })
    const pending = ui.togglePublication()
    if (change === 'Kitchen ABA') {
      props.kitchenId = 'b'
      props.kitchenId = 'a'
    }
    if (change === 'authority ABA') {
      props.canWrite = false
      props.canWrite = true
    }
    if (change === 'account ABA') {
      account.value = 'bob'
      account.value = 'alice'
      props.canWrite = false
      props.canWrite = true
    }
    if (change === 'disposal') scope.stop()
    let newer
    if (change !== 'disposal') {
      next = second
      newer = ui.togglePublication()
      assert.equal(calls.length, 2)
    }
    first.resolve()
    await pending
    assert.deepEqual(feedback, [])
    if (newer) {
      assert.equal(ui.saving.value, true)
      second.resolve()
      await newer
      assert.equal(ui.saving.value, false)
      assert.deepEqual(feedback, ['Kitchen shown in the directory'])
    }
    assert.deepEqual(calls[0], { kitchenId: 'a', slug: 'first' })
    scope.stop()
  })
}

test('Kitchen-only updates use record authority inside their transaction and reject revoked access', async () => {
  const tx = { update: (...args) => writes.push(args) },
    writes = [],
    actor = { uid: 'alice' },
    checks = []
  let denied = false
  const update = load('kitchen/server/identity/update.ts', 'updateKitchen', {
    useRuntimeConfig: () => ({ public: {} }),
    createError: (v) => Object.assign(new Error(v.statusMessage), v),
    requireFirestoreDocumentId: (v) => v,
    parseKitchenUpdate: (v) => v,
    readKitchenMutationActor: async () => actor,
    runGuardedServerTransaction: async (_, run) => run(tx),
    requireKitchenRecordMutationAuthority: async (actual, a, id) => {
      checks.push([actual, a, id])
      if (denied) throw new Error('revoked')
      return { ownerAppId: 'app' }
    },
    serverAuditStamp: (value) => value,
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
  })
  assert.deepEqual(
    await update(
      {},
      { kitchen_id: 'a', patch: { 'identity.visibility': true } }
    ),
    { ok: true, kitchen_id: 'a' }
  )
  assert.equal(checks[0][0], tx)
  assert.equal(checks[0][1], actor)
  assert.deepEqual(writes, [
    [
      'kitchens',
      'a',
      {
        'identity.visibility': true,
        updated: { by: 'alice', appId: 'app' },
      },
    ],
  ])
  denied = true
  await assert.rejects(
    update({}, { kitchen_id: 'a', patch: { 'identity.visibility': false } }),
    /revoked/
  )
  assert.equal(writes.length, 1)
})

test('Identity tools describe implemented controls and route to their actual pages', async () => {
  const {
    toolHypotheses: tools,
    records,
    clusters,
  } = load(
    'kitchen/models/identity-search-demand.ts',
    'kitchenIdentitySearchDemand',
    {}
  )
  assert.ok(!tools.some((tool) => tool.id.includes('link-place')))
  assert.ok(!clusters.some((cluster) => cluster.id === 'link'))
  const navigations = []
  const state = { value: null }
  const deps = {
    computed,
    watch: () => {},
    useAuth: () => ({ currentUser: ref({ uid: 'alice' }) }),
    useState: () => state,
    useWorkspace: () => ({ selectedId: ref('a') }),
    useRoute: () => ({ path: '/workspace/kitchen' }),
    useKitchenMenuCollection: () => ({ menus: ref([]) }),
    navigateTo: async (path) => navigations.push(path),
    kitchenCapabilityTools: { identity: tools },
  }
  const directory = load(
    'kitchen/composables/workspace/useKitchenCapabilityTools.ts',
    'useKitchenCapabilityToolDirectory',
    deps
  )()
  assert.equal(directory.tools.value.length, 5)
  for (const tool of tools) {
    assert.equal(tool.status, 'available')
    for (const path of tool.evidence) {
      const target = path.startsWith('fireux-places/')
        ? new URL(
            '../../../../fireux-places/src/' +
              path.slice('fireux-places/'.length),
            import.meta.url
          )
        : new URL(path, runtime)
      assert.ok(readFileSync(target, 'utf8').length)
    }
    assert.ok(records.some((record) => record.readBy.includes(tool.id)))
    assert.equal(await directory.performAction(tool.id), true)
  }
  assert.deepEqual(navigations, [
    '/workspace/kitchen/identity',
    '/workspace/kitchen/identity',
    '/workspace/kitchen/identity',
    '/workspace/kitchen/identity/operating-hours',
    '/workspace/kitchen/identity/appearance',
  ])
})

test('venue failure preserves Kitchen settings, while absent Kitchen hides them', async () => {
  const source = readFileSync(
    new URL('kitchen/components/Identity/Index.vue', runtime),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  async function render(status, kitchenReady) {
    const identity = {
      status: ref(status),
      outcome: ref(status),
      selectedKitchen: ref(null),
      listing: ref(
        kitchenReady
          ? {
              id: 'a',
              name: 'Kitchen',
              identity: { slug: 'kitchen', status: 'active' },
            }
          : null
      ),
      kitchenId: ref(kitchenReady ? 'a' : ''),
      placeId: ref(kitchenReady ? 'a' : ''),
      currencyCode: ref(''),
      canWriteKitchen: ref(kitchenReady),
      canWrite: ref(false),
      fields: ref({}),
      place: ref(null),
      mutationAuthority: ref(null),
    }
    const app = createSSRApp({
      setup: () => ({
        identity,
        workspaceEntryPath: '/workspace/kitchen',
        section: null,
        publicTo: '',
        debug: {},
        kitchenPath: '/kitchens/kitchen',
        kitchenStatus: 'Active',
        kitchenEditorOpen: false,
        sectionTitle: 'Venue details',
        sections: [],
        children: [],
      }),
      render: compile(template),
    })
    for (const name of [
      'UBreadcrumb',
      'UButton',
      'USkeleton',
      'PlaceEditIdentity',
      'ClientOnly',
      'USlideover',
      'PlaceEditGoogleReview',
      'PlaceDetail',
      'WorkspaceKitchenContext',
      'UAvatar',
      'UBadge',
      'UIcon',
      'FireCopyError',
      'PlaceEdit',
      'FireDiagnosticsDebugPanel',
    ])
      app.component(name, { render: () => null })
    const listingSource = readFileSync(
      new URL('kitchen/components/Identity/Listing.vue', runtime),
      'utf8'
    )
    app.component('KitchenIdentityListing', {
      props: ['identity'],
      setup: (props) =>
        load(
          'kitchen/components/Identity/Listing.vue',
          '({kitchenPath,kitchenStatus,kitchenEditorOpen})',
          {
            computed,
            ref,
            watch,
            defineProps: () => props,
          }
        ),
      render: compile(
        listingSource.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
      ),
    })
    const profileSource = readFileSync(
      new URL('kitchen/components/Identity/Profile.vue', runtime),
      'utf8'
    )
    app.component('KitchenIdentityProfile', {
      props: ['identity'],
      setup: (props) =>
        load(
          'kitchen/components/Identity/Profile.vue',
          '({sections,section,sectionTitle,kitchenPath,publicTo,editor})',
          {
            computed,
            ref,
            watch,
            defineProps: () => props,
            defineExpose: () => {},
            readKitchenVisibility: (kitchen) => kitchen?.identity?.visibility,
          }
        ),
      render: compile(
        profileSource.match(/<template>([\s\S]*?)<\/template>\s*<script/)[1]
      ),
    })
    app.component('FireState', {
      props: ['outcome'],
      setup: (p) => () => h('p', p.outcome),
    })
    app.component('UCard', {
      setup:
        (_, { slots }) =>
        () =>
          h('section', [slots.header?.(), slots.default?.(), slots.footer?.()]),
    })
    app.component('KitchenEditPublication', {
      render: () => h('span', 'Show in directory'),
    })
    app.component('KitchenEditCurrency', {
      render: () => h('span', 'Currency'),
    })
    app.component('UAlert', {
      props: ['title'],
      setup: (props) => () => h('p', props.title),
    })
    let suppliedToEditor = false
    app.component('KitchenIdentityListingEdit', {
      props: ['identity', 'open'],
      setup: (supplied) => {
        assert.equal(supplied.identity, identity)
        suppliedToEditor = true
        return () => null
      },
    })
    const html = await renderToString(app)
    assert.equal(
      suppliedToEditor,
      true,
      'Identity Listing passes its existing controller to the editor'
    )
    return html
  }
  for (const status of ['empty', 'error', 'pending']) {
    const html = await render(status, true)
    assert.match(html, /Show in directory/)
    assert.match(html, new RegExp(status === 'pending' ? 'loading' : status))
    assert.doesNotMatch(html, /Currency|Venue details unavailable/)
  }
  const empty = await render('empty', false)
  assert.doesNotMatch(empty, /Show in directory|Currency/)
  assert.match(empty, /empty/)
})

test('Identity sections use Place facts, keep nested Kitchen identity and close editors on scope changes', () => {
  const scope = effectScope()
  const kitchen = ref({
    identity: { slug: 'kitchen-a', status: 'active', visibility: true },
    currency_code: 'USD',
  })
  const identity = {
    status: ref('ready'),
    kitchenId: ref('a'),
    placeId: ref('a'),
    canWrite: ref(true),
    canWriteKitchen: ref(true),
    selectedKitchen: kitchen,
    listing: kitchen,
    place: ref({
      name: 'Venue A',
      tagline: 'Hello',
      default_currency_code: 'CHF',
      gallery_images: ['one', 'two'],
      social_links: { instagram: 'https://instagram.com/venue' },
    }),
    currencyCode: ref('CHF'),
  }
  const page = scope.run(() =>
    load(
      'kitchen/components/Identity/Profile.vue',
      '({sections, section, sectionTitle, kitchenPath, publicTo})',
      {
        computed,
        ref,
        watch,
        defineProps: () => ({ identity }),
        useRoute: () => ({ path: '/workspace/kitchen/identity' }),
        useWorkspaceEntryCta: () => ({
          workspaceEntryPath: '/workspace/kitchen',
        }),
        defineExpose: () => {},
        readKitchenVisibility: (k) => k.identity.visibility,
      }
    )
  )
  Object.assign(
    page,
    scope.run(() =>
      load(
        'kitchen/components/Identity/Listing.vue',
        '({kitchenEditorOpen, kitchenStatus})',
        { computed, ref, watch, defineProps: () => ({ identity }) }
      )
    )
  )
  assert.equal(page.kitchenPath.value, '/kitchens/kitchen-a')
  assert.equal(page.kitchenStatus.value, 'Active')
  assert.equal(page.publicTo.value, '/kitchens/kitchen-a')
  assert.equal(page.sections.value.length, 5)
  assert.equal(
    page.sections.value
      .find((s) => s.value === 'visit')
      .fields.find((f) => f.label === 'Currency').value,
    'CHF'
  )
  assert.equal(
    page.sections.value
      .find((s) => s.value === 'photos')
      .fields.find((f) => f.label === 'Gallery').value,
    '2 photos'
  )
  page.section.value = 'visit'
  page.kitchenEditorOpen.value = true
  assert.equal(page.sectionTitle.value, 'Location and currency')
  identity.kitchenId.value = 'b'
  identity.kitchenId.value = 'a'
  assert.equal(page.section.value, null)
  assert.equal(page.kitchenEditorOpen.value, false)
  page.section.value = 'profile'
  page.kitchenEditorOpen.value = true
  identity.canWrite.value = false
  identity.canWrite.value = true
  assert.equal(
    page.section.value,
    'profile',
    'a transient Place refresh retains the chosen section'
  )
  assert.equal(page.kitchenEditorOpen.value, true)
  identity.canWriteKitchen.value = false
  assert.equal(page.section.value, null)
  assert.equal(page.kitchenEditorOpen.value, false)
  identity.place.value = null
  assert.equal(page.sections.value[0].fields[0].value, '')
  scope.stop()
})
