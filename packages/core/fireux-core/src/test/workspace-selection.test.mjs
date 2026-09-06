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
  watch,
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


test('compact and open string forms keep failed drafts and submit the same trimmed value', async () => {
  const source = readFileSync(new URL('../runtime/components/Workspace/Test/Form.vue', import.meta.url), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .* from .+\n/gm, '')
  let fail = true
  const writes = [], events = []
  const props = { label: 'Create', submit: async value => { if (fail) throw new Error('offline'); writes.push(value) } }
  const form = compileFunction(`${stripTypeScriptTypes(source)}; return { save, value, busy, error }`, ['ref', 'watch', 'defineProps', 'defineEmits'])(ref, watch, () => props, () => event => events.push(event))
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
})
