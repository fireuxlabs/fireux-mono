import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  nextTick,
  ref,
  toValue,
  watch,
  watchEffect,
} from 'vue'

function load(relativePath, name, dependencies) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    .replace(/^import .* from .+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function createWorkspace() {
  const cookies = new Map()
  const states = new Map()
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
      useCookie: (key, options) => getRef(cookies, key, options.default),
      useState: (key, init) => getRef(states, key, init),
      useFireUXConfig: () => ({ appId }),
      normalizeString: (value) => String(value ?? '').trim(),
    }
  )
  return {
    useWorkspace,
    cookies,
    states,
    changeApp: (value) => {
      appId = value
    },
  }
}

for (const family of ['project', 'kitchen']) {
  test(`${family} index maintains selection through loading, switches, errors and removal`, async () => {
    const harness = createWorkspace()
    const workspace = harness.useWorkspace(family)
    workspace.select('saved')
    const records = ref([])
    const outcome = ref('pending')
    const source = {
      [family === 'project' ? 'projects' : 'kitchens']: records,
      outcome,
    }
    const useIndex = load(
      family === 'project'
        ? '../runtime/project/composables/workspace/index/useProjectWorkspaceIndex.ts'
        : '../../../../extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex.ts',
      family === 'project'
        ? 'useProjectWorkspaceIndex'
        : 'useKitchenWorkspaceIndex',
      {
        watch,
        useWorkspace: harness.useWorkspace,
        [family === 'project'
          ? 'useProjectCollection'
          : 'useKitchenWorkspaceKitchens']: () => source,
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

test('selection restores from its cookie and stays scoped to the App and family', () => {
  const harness = createWorkspace()
  harness.useWorkspace('project').select('project-a')
  harness.states.clear()
  assert.equal(harness.useWorkspace('project').selectedId.value, 'project-a')
  assert.equal(harness.useWorkspace('kitchen').selectedId.value, '')
  harness.changeApp('other-app')
  assert.equal(harness.useWorkspace('project').selectedId.value, '')
})

function loadTest(states) {
  return load('../runtime/composables/fireux/workspace/useTest.ts', 'useTest', {
    computed,
    watchEffect,
    useState: (key, init) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    },
    defineWorkspaceCapabilityContext: (value) => value,
  })
}

test('Test record selection cannot leak between Entities with the same record ids', () => {
  const states = new Map()
  const useTest = loadTest(states)
  const source = {
    capabilityId: 'project.test',
    records: computed(() => [
      { id: 'shared', value: 'one' },
      { id: 'other', value: 'two' },
    ]),
    status: computed(() => 'ready'),
    limit: computed(() => null),
    canWrite: computed(() => false),
    primitives: {},
  }
  const scope = effectScope()
  const first = scope.run(() => useTest({ ...source, entityId: 'entity-a' }))
  first.natives.select('other')
  const second = scope.run(() => useTest({ ...source, entityId: 'entity-b' }))
  assert.equal(first.state.value.selectedTestId, 'other')
  assert.equal(second.state.value.selectedTestId, 'shared')
  scope.stop()
})

test('Test keeps focus through loading and errors, and reconciles only settled records', async () => {
  const states = new Map()
  const useTest = loadTest(states)
  const records = ref([
    { id: 'a', value: 'first' },
    { id: 'b', value: 'second' },
  ])
  const status = ref('ready')
  const scope = effectScope()
  const test = scope.run(() =>
    useTest({
      capabilityId: 'kitchen.test',
      entityId: 'kitchen-a',
      records,
      status,
      limit: computed(() => 2),
      canWrite: computed(() => true),
      primitives: {},
    })
  )
  test.natives.select('b')
  await nextTick()
  status.value = 'loading'
  records.value = []
  await nextTick()
  assert.equal(test.state.value.selectedTestId, 'b')
  status.value = 'error'
  await nextTick()
  assert.equal(test.state.value.selectedTestId, 'b')
  records.value = [
    { id: 'a', value: 'first' },
    { id: 'b', value: 'second' },
  ]
  status.value = 'ready'
  await nextTick()
  assert.equal(test.state.value.selectedTestId, 'b')
  records.value = [{ id: 'a', value: 'first' }]
  await nextTick()
  assert.equal(test.state.value.selectedTestId, 'a')
  records.value = []
  status.value = 'empty'
  await nextTick()
  assert.equal(test.state.value.selectedTestId, '')
  scope.stop()
})

test('workspace creation offers pricing at capacity and waits for membership', () => {
  const workspaceAllowanceUsed = load(
    '../runtime/app/utils/workspace-allowance.ts',
    'workspaceAllowanceUsed',
    {}
  )
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
    membership: ref({ subscription: 'free', projects: [] }),
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
      useAppSession: () => session,
      useFireUXConfig: () => config,
      appSubscriptionCapacity,
      workspaceAllowanceUsed,
      resolveWorkspaceCanCreate,
    }
  )
  const creation = useWorkspaceCreation('project')
  assert.equal(creation.canCreate.value, true)
  session.membership.value.projects = ['first']
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, true)
  session.membership.value = {
    subscription: 'free',
    kitchens: ['first', 'first'],
  }
  assert.equal(workspaceAllowanceUsed(session.membership.value), 1)
  assert.equal(creation.showUpgrade.value, true)
  session.membership.value.subscription = 'business'
  assert.equal(creation.canCreate.value, true)
  assert.equal(creation.showUpgrade.value, false)
  session.pending.value = true
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, false)
  session.pending.value = false
  session.error.value = new Error('unavailable')
  assert.equal(creation.canCreate.value, false)
  assert.equal(creation.showUpgrade.value, false)
  session.error.value = undefined
  session.membership.value = null
  assert.equal(creation.canCreate.value, true)
  assert.equal(creation.showUpgrade.value, false)
})

test('Test info and AI suggestions share tool meanings and live availability', () => {
  const useTestAI = load(
    '../runtime/composables/fireux/workspace/useTestAI.ts',
    'useTestAI',
    { computed, toValue }
  )
  const derived = ref({
    capability: {
      primitives: {
        create: { available: true },
        read: { available: false },
        update: { available: false },
        delete: { available: false },
      },
    },
  })
  const ai = useTestAI(derived)
  assert.equal(ai.tools.value.length, 4)
  assert.deepEqual(ai.suggestions.value, [
    { label: 'Create a Test called “My first test”' },
  ])
  derived.value.capability.primitives.create.available = false
  derived.value.capability.primitives.read.available = true
  assert.deepEqual(ai.suggestions.value, [{ label: 'Show me my Test records' }])
  assert.equal(
    ai.tools.value.find((tool) => tool.id === 'create').available,
    false
  )
  assert.match(ai.description.ai, /require confirmation/)
})

test('Test Create keeps the form open and explains rejected or failed writes', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/components/Workspace/Test/Crud/Create.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .* from .+\n/gm, '')
  const events = []
  const props = { primitives: { create: async () => false } }
  const form = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn { create, value, pending, error }`,
    ['ref', 'watch', 'defineProps', 'defineEmits']
  )(
    ref,
    watch,
    () => props,
    () =>
      (...args) =>
        events.push(args)
  )
  form.value.value = 'Example'
  await form.create()
  assert.match(form.error.value, /access or allowance/)
  assert.equal(events.length, 0)
  props.primitives.create = async () => {
    throw new Error('Connection failed')
  }
  await form.create()
  assert.equal(form.error.value, 'Connection failed')
  assert.equal(form.pending.value, false)
  assert.equal(events.length, 0)
  props.primitives.create = async () => true
  await form.create()
  assert.deepEqual(events, [['update:open', false]])
  assert.equal(form.value.value, '')
})

test('Team retains selection while its collection is unsettled', async () => {
  const useTeam = load(
    '../runtime/composables/fireux/workspace/useTeam.ts',
    'useTeam',
    { computed, ref, watchEffect }
  )
  const members = ref([{ id: 'first' }, { id: 'chosen' }])
  const settled = ref(true)
  const scope = effectScope()
  const team = scope.run(() =>
    useTeam({ members, settled, canWrite: ref(true) })
  )
  team.selectedTeamMemberId.value = 'chosen'
  settled.value = false
  members.value = []
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'chosen')
  members.value = [{ id: 'first' }, { id: 'chosen' }]
  settled.value = true
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'chosen')
  members.value = [{ id: 'first' }]
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'first')
  scope.stop()
})
