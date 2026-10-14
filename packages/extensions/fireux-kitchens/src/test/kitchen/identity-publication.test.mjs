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
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import test from 'node:test'

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
    createError: (v) => Object.assign(new Error(v.statusMessage), v),
    requireFirestoreDocumentId: (v) => v,
    parseKitchenUpdate: (v) => v,
    readKitchenMutationActor: async () => actor,
    runGuardedServerTransaction: async (_, run) => run(tx),
    requireKitchenRecordMutationAuthority: async (actual, a, id) => {
      checks.push([actual, a, id])
      if (denied) throw new Error('revoked')
    },
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens' },
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
  assert.deepEqual(writes, [['kitchens', 'a', { 'identity.visibility': true }]])
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
    '/workspace/kitchen/identity/profile',
    '/workspace/kitchen/identity/profile',
    '/workspace/kitchen/identity/operating-hours',
    '/workspace/kitchen/identity/appearance',
  ])
})

test('venue failure preserves Kitchen settings, while absent Kitchen hides them', async () => {
  const source = readFileSync(
    new URL('kitchen/components/Workspace/Identity/Index.vue', runtime),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  async function render(status, kitchenReady) {
    const identity = {
      status: ref(status),
      outcome: ref(kitchenReady ? 'ready' : 'idle'),
      selectedKitchen: ref(
        kitchenReady
          ? {
              id: 'a',
              name: 'Kitchen',
              identity: { slug: 'kitchen', status: 'active' },
            }
          : null
      ),
      kitchenId: ref(kitchenReady ? 'a' : ''),
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
      'KitchenListingEdit',
      'UAvatar',
      'UBadge',
      'UIcon',
      'MoleculesCopyError',
      'PlaceEdit',
      'DiagnosticsDebugPanel',
    ])
      app.component(name, { render: () => null })
    const listingSource = readFileSync(
      new URL('kitchen/components/Workspace/Identity/Listing.vue', runtime),
      'utf8'
    )
    app.component('WorkspaceKitchenIdentityListing', {
      props: ['identity'],
      setup: (props) =>
        load(
          'kitchen/components/Workspace/Identity/Listing.vue',
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
    app.component('USkeleton', { render: () => h('p', 'Loading identity') })
    app.component('MoleculesStateCard', {
      props: ['state'],
      setup: (p) => () => h('p', p.state),
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
    return renderToString(app)
  }
  for (const status of ['missing', 'error', 'pending']) {
    const html = await render(status, true)
    assert.match(html, /Show in directory/)
    assert.doesNotMatch(
      html,
      /Currency|Loading identity|Venue details unavailable/
    )
  }
  const empty = await render('empty', false)
  assert.doesNotMatch(empty, /Show in directory|Currency/)
  assert.match(empty, /Loading identity/)
})

test('Identity sections use Place facts, keep nested Kitchen identity and close editors on scope changes', () => {
  const scope = effectScope()
  const identity = {
    status: ref('ready'),
    kitchenId: ref('a'),
    placeId: ref('a'),
    canWrite: ref(true),
    canWriteKitchen: ref(true),
    selectedKitchen: ref({
      identity: { slug: 'kitchen-a', status: 'active', visibility: true },
      currency_code: 'USD',
    }),
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
      'kitchen/components/Workspace/Identity/Profile.vue',
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
        'kitchen/components/Workspace/Identity/Listing.vue',
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
