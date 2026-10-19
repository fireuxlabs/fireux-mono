import { useCommandScope } from '../runtime/composables/fireux/commands/useCommandScope.ts'
import {
  isAppUserRole,
  isAppUserSubscription,
} from '../runtime/app/models/app-user.model.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  nextTick,
  reactive,
  ref,
  toValue,
  watch,
  onScopeDispose,
} from 'vue'

function load(relativePath, name, dependencies) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function createWorkspace() {
  const cookies = new Map()
  const states = new Map()
  const cookieOptions = new Map()
  let appId = 'proving-app'
  const getRef = (map, key, init) => {
    if (!map.has(key)) map.set(key, ref(init()))
    return map.get(key)
  }
  const useWorkspace = load(
    '../runtime/composables/fireux/workspace/useWorkspace.ts',
    'useWorkspace',
    {
      computed,
      watch,
      useCookie: (key, options) => {
        cookieOptions.set(key, options)
        return getRef(cookies, key, options.default)
      },
      useState: (key, init) => getRef(states, key, init),
      useFireUXConfig: () => ({ appId }),
      normalizeString: (value) => String(value ?? '').trim(),
    }
  )
  return {
    useWorkspace,
    cookies,
    cookieOptions,
    states,
    changeApp: (value) => {
      appId = value
    },
  }
}

for (const family of [
  'project',
  'kitchen',
  'blank',
  'supplier',
  'portfolio',
  'property',
]) {
  test(`${family} index maintains selection through loading, switches, errors and removal`, async () => {
    const harness = createWorkspace()
    const workspace = harness.useWorkspace(family)
    workspace.select('saved')
    const records = ref([])
    const outcome = ref('pending')
    const source = {
      [{
        project: 'projects',
        kitchen: 'kitchens',
        blank: 'blanks',
        supplier: 'suppliers',
        portfolio: 'portfolios',
        property: 'properties',
      }[family]]: records,
      projectIds: ref([]),
      outcome,
    }
    const useIndex = load(
      family === 'project'
        ? '../../../../ecosystem/fireux-fireux/src/runtime/project/composables/workspace/useProjectWorkspaceIndex.ts'
        : family === 'kitchen'
          ? '../../../../extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex.ts'
          : family === 'blank'
            ? '../../../../../projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/index/useBlankWorkspaceIndex.ts'
            : family === 'supplier'
              ? '../../../../extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/useSupplierWorkspaceIndex.ts'
              : family === 'portfolio'
                ? '../../../../extensions/fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspaceIndex.ts'
                : '../../../../extensions/fireux-properties/src/runtime/property/composables/workspace/usePropertyWorkspaceIndex.ts',
      family === 'project'
        ? 'useProjectWorkspaceIndex'
        : family === 'kitchen'
          ? 'useKitchenWorkspaceIndex'
          : family === 'blank'
            ? 'useBlankWorkspaceIndex'
            : family === 'supplier'
              ? 'useSupplierWorkspaceIndex'
              : family === 'portfolio'
                ? 'usePortfolioWorkspaceIndex'
                : 'usePropertyWorkspaceIndex',
      {
        computed,
        watch,
        useCommandScope,
        useWorkspace: harness.useWorkspace,
        useWorkspaceEntryCta: () => ({
          workspaceEntryPath: ref('/workspace/kitchen'),
        }),
        useSupplierAccess: () => ({
          ids: computed(() => records.value.map((record) => record.id)),
          outcome,
        }),
        useSupplierCollection: () => source,
        usePortfolioAccess: () => ({
          ids: computed(() => records.value.map((record) => record.id)),
          outcome,
        }),
        usePortfolioCollection: () => source,
        usePropertyAccess: () => ({
          ids: computed(() => records.value.map((record) => record.id)),
          outcome,
        }),
        usePropertyCollection: () => source,
        propertyWorkspaceSwitchPath: () => undefined,
        useAppSession: () => ({
          uid: ref('actor'),
          pending: ref(false),
          error: ref(undefined),
          appUser: ref({ subscription: 'free' }),
        }),
        resolveAppUserAccess: load(
          '../runtime/app/utils/app-user-access.ts',
          'resolveAppUserAccess',
          { isAppUserRole, isAppUserSubscription }
        ),
        useFireUXConfig: () => ({ appId: 'proving-app' }),
        useState: (key, init) => {
          if (!harness.states.has(key)) harness.states.set(key, ref(init()))
          return harness.states.get(key)
        },
        useRoute: () => ({
          path: '/workspace/kitchen',
          meta: { workspace: 'kitchen' },
          query: {},
          hash: '',
          matched: [],
        }),
        useRouter: () => ({ getRoutes: () => [] }),
        kitchenWorkspaceSwitchPath: load(
          '../../../../extensions/fireux-kitchens/src/runtime/kitchen/utils/workspace-switch-route.ts',
          'kitchenWorkspaceSwitchPath',
          {}
        ),
        navigateTo: () => {
          throw new Error('Selection without a route request must not navigate')
        },
        [family === 'project'
          ? 'useProjectCollection'
          : family === 'kitchen'
            ? 'useKitchenWorkspaceKitchens'
            : 'useBlankCollection']: () => source,
      }
    )
    const scope = effectScope()
    const index = scope.run(useIndex)
    scope.run(useIndex) // Selector and persistent sidebar share the same selection.
    assert.equal(index.selectedId.value, 'saved')
    assert.equal('clear' in index, false)

    records.value = [{ id: 'first' }, { id: 'saved' }]
    outcome.value = 'ready'
    await nextTick()
    assert.equal(index.selectedId.value, 'saved')
    index.select('first')
    await nextTick()
    assert.equal(index.selectedId.value, 'first')
    records.value.reverse()
    await nextTick()
    assert.equal(index.selectedId.value, 'first')

    outcome.value = 'pending'
    records.value = []
    await nextTick()
    assert.equal(index.selectedId.value, 'first')
    outcome.value = 'error'
    await nextTick()
    assert.equal(index.selectedId.value, 'first')

    source.projectIds.value = ['retained']
    outcome.value = family === 'project' ? 'empty' : 'missing'
    await nextTick()
    assert.equal(index.outcome.value, 'missing')
    assert.equal(index.selectedId.value, 'first')
    source.projectIds.value = []

    records.value = [{ id: 'replacement' }]
    outcome.value = 'ready'
    await nextTick()
    assert.equal(index.selectedId.value, 'replacement')
    index.select('')
    await nextTick()
    assert.equal(index.selectedId.value, 'replacement')

    outcome.value = 'empty'
    records.value = []
    await nextTick()
    assert.equal(index.selectedId.value, '')
    records.value = [{ id: 'created' }]
    outcome.value = 'ready'
    await nextTick()
    assert.equal(index.selectedId.value, 'created')
    scope.stop()
  })
}

test('Kitchen root handoff waits for ready access and preserves unrelated query and hash', async () => {
  const harness = createWorkspace()
  const workspace = harness.useWorkspace('kitchen')
  workspace.select('previous')
  const source = {
    kitchens: ref([{ id: 'other' }, { id: 'allowed' }]),
    outcome: ref('pending'),
  }
  const route = reactive({
    path: '/',
    meta: { workspace: 'kitchen' },
    query: { kitchenId: 'allowed', keep: 'yes' },
    hash: '#overview',
    matched: [],
  })
  const navigations = []
  const useIndex = load(
    '../../../../extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex.ts',
    'useKitchenWorkspaceIndex',
    {
      computed,
      watch,
      useCommandScope,
      useWorkspace: harness.useWorkspace,
      useWorkspaceEntryCta: (family) => {
        assert.equal(family, 'kitchen')
        return { workspaceEntryPath: ref('/') }
      },
      useKitchenWorkspaceKitchens: () => source,
      useAppSession: () => ({
        uid: ref('actor'),
        pending: ref(false),
        error: ref(undefined),
        appUser: ref({ subscription: 'free' }),
      }),
      resolveAppUserAccess: load(
        '../runtime/app/utils/app-user-access.ts',
        'resolveAppUserAccess',
        { isAppUserRole, isAppUserSubscription }
      ),
      useFireUXConfig: () => ({ appId: 'proving-app' }),
      useState: (key, init) => {
        if (!harness.states.has(key)) harness.states.set(key, ref(init()))
        return harness.states.get(key)
      },
      useRoute: () => route,
      useRouter: () => ({ getRoutes: () => [] }),
      kitchenWorkspaceSwitchPath: load(
        '../../../../extensions/fireux-kitchens/src/runtime/kitchen/utils/workspace-switch-route.ts',
        'kitchenWorkspaceSwitchPath',
        {}
      ),
      navigateTo: (to, options) => {
        navigations.push({
          to: { ...to, query: { ...to.query } },
          options: { ...options },
        })
        route.query = to.query
      },
    }
  )
  const scope = effectScope()
  const index = scope.run(useIndex)
  assert.equal(index.selectedId.value, 'previous')
  assert.equal(route.query.kitchenId, 'allowed')
  assert.deepEqual(navigations, [])

  source.outcome.value = 'error'
  await nextTick()
  assert.equal(index.selectedId.value, 'previous')
  assert.equal(route.query.kitchenId, 'allowed')
  assert.deepEqual(navigations, [])

  source.outcome.value = 'ready'
  await nextTick()
  assert.equal(index.selectedId.value, 'allowed')
  assert.deepEqual(navigations, [
    {
      to: { path: '/', query: { keep: 'yes' }, hash: '#overview' },
      options: { replace: true },
    },
  ])
  assert.deepEqual(route.query, { keep: 'yes' })

  route.meta.workspace = undefined
  route.query = { kitchenId: 'other', keep: 'yes' }
  await nextTick()
  assert.equal(index.selectedId.value, 'allowed')
  assert.equal(route.query.kitchenId, 'other')
  assert.equal(
    navigations.length,
    1,
    'the public root must not consume Kitchen selection intent'
  )
  scope.stop()
})

test('selection restores from its cookie and stays scoped to the App and family', () => {
  const harness = createWorkspace()
  harness.useWorkspace('project').select('project-a')
  harness.states.clear()
  assert.equal(harness.useWorkspace('project').selectedId.value, 'project-a')
  assert.equal(harness.useWorkspace('kitchen').selectedId.value, '')
  harness.changeApp('other-app')
  assert.equal(harness.useWorkspace('project').selectedId.value, '')
})

test('workspace creation uses only the supplied domain count and waits for access', () => {
  const appSubscriptionCapacity = load(
    '../runtime/app/utils/app-subscription-capacity.ts',
    'appSubscriptionCapacity',
    {}
  )
  const resolveWorkspaceCanCreate = load(
    '../runtime/utils/workspace-policy.ts',
    'resolveWorkspaceCanCreate',
    {}
  )
  const session = {
    pending: ref(false),
    error: ref(undefined),
    appUser: ref({ subscription: 'free' }),
  }
  const config = {
    role: 'global',
    workspaceConfig: {},
    subscriptionCapacity: { project: { free: 1, premium: 1, business: null } },
  }
  const useWorkspaceCreation = load(
    '../runtime/composables/fireux/workspace/useWorkspaceCreation.ts',
    'useWorkspaceCreation',
    {
      computed,
      toValue,
      useAppSession: () => session,
      useFireUXConfig: () => config,
      appSubscriptionCapacity,
      resolveWorkspaceCanCreate,
    }
  )
  const usage = ref({ count: 0, outcome: 'empty' })
  const creation = useWorkspaceCreation('project', usage)
  assert.equal(creation.canCreate.value, true)
  usage.value = { count: 1, outcome: 'ready' }
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, true)
  session.appUser.value.subscription = 'business'
  assert.equal(creation.canCreate.value, true)
  assert.equal(creation.showUpgrade.value, false)
  for (const outcome of ['idle', 'pending', 'error', 'missing']) {
    usage.value.outcome = outcome
    assert.equal(creation.canCreate.value, false, outcome)
    assert.equal(creation.showUpgrade.value, false, outcome)
  }
  usage.value.outcome = 'ready'
  for (const count of [-1, 0.5, NaN]) {
    usage.value.count = count
    assert.equal(creation.canCreate.value, false)
  }
  usage.value.count = 0
  session.pending.value = true
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, false)
  session.pending.value = false
  session.error.value = new Error('unavailable')
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, false)
  session.error.value = undefined
  session.appUser.value = null
  usage.value.outcome = 'idle'
  assert.equal(
    creation.canCreate.value,
    true,
    'guest may enter the sign-in journey'
  )
  assert.equal(creation.showUpgrade.value, false)
})

test('compact and open string forms keep failed drafts and submit the same trimmed value', async () => {
  const source = readFileSync(
    new URL('../runtime/components/Workspace/Test/Form.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  let fail = true
  const writes = [],
    events = []
  const props = {
    label: 'Create',
    submit: async (value) => {
      if (fail) throw new Error('offline')
      writes.push(value)
    },
  }
  const owner = effectScope()
  const capture = load(
    '../runtime/composables/fireux/commands/useCommandScope.ts',
    'useCommandScope',
    { watch, onScopeDispose }
  )
  const form = owner.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return { save, value, busy, error }`,
      ['ref', 'watch', 'defineProps', 'defineEmits', 'useCommandScope']
    )(
      ref,
      watch,
      () => props,
      () => (event) => events.push(event),
      capture
    )
  )
  form.value.value = ' hello '
  await form.save()
  assert.equal(form.value.value, ' hello ')
  assert.equal(form.busy.value, false)
  assert.equal(events.length, 0)
  fail = false
  await form.save()
  assert.deepEqual(writes, ['hello'])
  assert.equal(form.value.value, '')
  assert.deepEqual(events, ['saved'])
  owner.stop()
})

test('last selected Kitchen uses a persistent root-path cookie and survives a fresh runtime', () => {
  const harness = createWorkspace()
  const workspace = harness.useWorkspace('kitchen')
  workspace.select('baeren')
  const options = harness.cookieOptions.get(
    'fireux-workspace-proving-app-kitchen'
  )
  assert.equal(options.path, '/')
  assert.equal(options.maxAge, 60 * 60 * 24 * 365)
  harness.states.clear()
  const restored = harness.useWorkspace('kitchen')
  for (const outcome of ['idle', 'pending', 'error', 'missing']) {
    restored.reconcile(['la-tap'], outcome)
    assert.equal(restored.selectedId.value, 'baeren')
  }
  restored.reconcile(['la-tap', 'baeren'], 'ready')
  assert.equal(restored.selectedId.value, 'baeren')
  restored.reconcile(['la-tap'], 'ready')
  assert.equal(restored.selectedId.value, 'la-tap')
})

test('component-local cookie refs all retain the last shared selection on disposal and restart', () => {
  let stored = 'first'
  const states = new Map(),
    cookies = []
  const use = load(
    '../runtime/composables/fireux/workspace/useWorkspace.ts',
    'useWorkspace',
    {
      computed,
      watch,
      normalizeString: (value) => String(value || '').trim(),
      useFireUXConfig: () => ({ appId: 'app' }),
      useCookie: () => {
        const value = ref(stored)
        cookies.push(value)
        return value
      },
      useState: (key, init) => {
        if (!states.has(key)) states.set(key, ref(init()))
        return states.get(key)
      },
    }
  )
  const scope = effectScope()
  const [home, header] = scope.run(() => [use('kitchen'), use('kitchen')])
  home.select('baeren')
  assert.equal(header.selectedId.value, 'baeren')
  for (const cookie of cookies) stored = cookie.value // Nuxt's disposal flush
  assert.equal(stored, 'baeren')
  scope.stop()
  states.clear()
  assert.equal(use('kitchen').selectedId.value, 'baeren')
})

test('last selection survives reconciliation; first available is used only after access settles', () => {
  const harness = createWorkspace(),
    workspace = harness.useWorkspace('kitchen')
  for (const outcome of ['idle', 'pending', 'error', 'missing']) {
    workspace.reconcile(['first', 'baeren'], outcome)
    assert.equal(workspace.selectedId.value, '')
  }
  workspace.reconcile(['first', 'baeren'], 'ready')
  assert.equal(workspace.selectedId.value, 'first')
  workspace.select('baeren')
  workspace.reconcile(['first', 'baeren'], 'ready')
  assert.equal(workspace.selectedId.value, 'baeren')
  workspace.select('revoked')
  workspace.reconcile(['first'], 'pending')
  assert.equal(workspace.selectedId.value, 'revoked')
  workspace.reconcile(['first'], 'ready')
  assert.equal(workspace.selectedId.value, 'first')
})
