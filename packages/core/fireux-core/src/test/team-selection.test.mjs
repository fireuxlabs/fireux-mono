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

test('Team retains selection while its collection is unsettled', async () => {
  const useWorkspaceTeam = load(
    '../runtime/workspace/composables/useWorkspaceTeam.ts',
    'useWorkspaceTeam',
    { computed, ref, watchEffect, defineWorkspaceCapabilityContext: value => value }
  )
  const members = ref([{ id: 'first' }, { id: 'chosen' }])
  const pending = ref(false)
  const scope = effectScope()
  const team = scope.run(() =>
    useWorkspaceTeam({ members, pending, error: ref(null), workspaceId: ref('one'), capabilityId: 'test.team', canWrite: ref(true) })
  )
  team.selectedTeamMemberId.value = 'chosen'
  pending.value = true
  members.value = []
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'chosen')
  members.value = [{ id: 'first' }, { id: 'chosen' }]
  pending.value = false
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'chosen')
  members.value = [{ id: 'first' }]
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'first')
  scope.stop()
})


test('Team focuses a created member only in its original workspace and shares capacity', async () => {
  const useWorkspaceTeam = load('../runtime/workspace/composables/useWorkspaceTeam.ts', 'useWorkspaceTeam', {
    computed, ref, watchEffect, defineWorkspaceCapabilityContext: value => value,
  })
  const members = ref([{id: 'one'}])
  const workspaceId = ref('workspace-a')
  const scope = effectScope()
  const team = scope.run(() => useWorkspaceTeam({members, workspaceId, capabilityId: 'test.team', pending: ref(false), error: ref(null), canWrite: ref(true), memberLimit: ref(2)}))
  team.selectCreated('new')
  members.value.push({id: 'new'})
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'new')
  assert.equal(team.canCreateTeamMember.value, false)
  assert.equal(team.derived.value.capability.primitives.create.available, false)
  team.selectCreated('late')
  workspaceId.value = 'workspace-b'
  members.value = [{id: 'other'}]
  await nextTick()
  members.value.push({id: 'late'})
  await nextTick()
  assert.equal(team.selectedTeamMemberId.value, 'other')
  scope.stop()
})
