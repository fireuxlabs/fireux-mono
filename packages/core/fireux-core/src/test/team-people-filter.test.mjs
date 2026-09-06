import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, watch, nextTick } from 'vue'
import test from 'node:test'

test('People filters derive titles and access roles from live members', async () => {
  const source = readFileSync(new URL('../runtime/composables/fireux/workspace/useTeamPeopleFilter.ts', import.meta.url), 'utf8').replace(/^import .*\n/gm, '').replace('export function', 'function')
  const make = compileFunction(`${stripTypeScriptTypes(source)}; return useTeamPeopleFilter`, ['computed', 'ref', 'toValue', 'watch'])(computed, ref, toValue, watch)
  const members = ref([{ id: 'a', jobTitle: 'Commis', role: 'member' }, { id: 'b', jobTitle: 'Commis', role: 'operator' }, { id: 'c', jobTitle: '', role: 'owner' }])
  const state = make(members)
  assert.ok(state.options.value.some(item => item.label === 'Role: Commis (2)'))
  state.filter.value = 'job:Commis'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['a', 'b'])
  state.filter.value = 'role:operator'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['b'])
  state.filter.value = 'job:'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['c'])
  state.filter.value = 'job:Commis'
  members.value = [members.value[2]]
  await nextTick()
  assert.equal(state.filter.value, 'all')
  assert.equal(state.filtered.value.length, 1)
  members.value = []
  await nextTick()
  assert.deepEqual(state.options.value, [{ label: 'All people (0)', value: 'all' }])
})
