import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, reactive, effectScope, nextTick } from 'vue'
import test from 'node:test'

const settle = () => new Promise((resolve) => setImmediate(resolve))

function setup() {
  const component = readFileSync(
    new URL('../runtime/components/Workspace/Team/Roles.vue', import.meta.url),
    'utf8'
  )
  const source = component
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*\n/gm, '')
  const props = reactive({
    endpoint: '/roles',
    workspaceId: 'kitchen-a',
    memberId: 'alice',
    suggestions: [],
  })
  const requests = []
  const emissions = []
  const fetch = (_endpoint, options) =>
    new Promise((resolve, reject) =>
      requests.push({ options, resolve, reject })
    )
  const execute = compileFunction(
    `${stripTypeScriptTypes(source)}; return {roles,selected,pending,error}`,
    [
      'computed',
      'ref',
      'watch',
      'defineProps',
      'defineEmits',
      'defineExpose',
      'useRequireUser',
      '$fetch',
    ]
  )
  const scope = effectScope()
  const state = scope.run(() =>
    execute(
      computed,
      ref,
      watch,
      () => props,
      () => (name, value) => emissions.push({ name, value }),
      () => {},
      async () => ({ getIdToken: async () => 'token' }),
      fetch
    )
  )
  return { props, requests, emissions, state, stop: () => scope.stop() }
}

test('focus preserves roster labels; workspace changes clear them and stale reads cannot replace current roles', async () => {
  const f = setup()
  try {
    await settle()
    const roles = [{ id: 'operator', name: 'Operator' }]
    const labels = { alice: ['Operator'], bob: [] }
    f.requests[0].resolve({ roles, labels, roleIds: ['operator'] })
    await settle()
    assert.deepEqual(f.state.roles.value, roles)
    assert.deepEqual(f.emissions.at(-1).value, labels)
    const emissionCount = f.emissions.length

    f.props.memberId = 'bob'
    await nextTick()
    await settle()
    assert.equal(f.state.pending.value, true)
    assert.deepEqual(f.state.roles.value, roles)
    assert.equal(
      f.emissions.length,
      emissionCount,
      'focus must not emit an empty roster label map'
    )
    assert.deepEqual(
      f.state.selected.value,
      [],
      'previous member assignment must not leak into new focus'
    )

    f.props.workspaceId = 'kitchen-b'
    await nextTick()
    await settle()
    assert.deepEqual(f.state.roles.value, [])
    assert.deepEqual(f.emissions.at(-1).value, {})
    const workspaceEmissionCount = f.emissions.length
    f.requests[1].resolve({
      roles: [{ id: 'old', name: 'Old' }],
      labels: { bob: ['Old'] },
      roleIds: ['old'],
    })
    await settle()
    assert.deepEqual(f.state.roles.value, [])
    assert.equal(f.emissions.length, workspaceEmissionCount)
    assert.equal(
      f.state.pending.value,
      true,
      'stale completion must not clear current loading state'
    )

    f.requests[2].resolve({
      roles: [{ id: 'dev', name: 'Dev' }],
      labels: { bob: ['Dev'] },
      roleIds: ['dev'],
    })
    await settle()
    assert.deepEqual(f.state.selected.value, ['dev'])
    assert.deepEqual(f.emissions.at(-1).value, { bob: ['Dev'] })
    assert.equal(f.state.pending.value, false)
  } finally {
    f.stop()
  }
})
