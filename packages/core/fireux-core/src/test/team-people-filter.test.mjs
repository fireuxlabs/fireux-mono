import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, nextTick } from 'vue'
import test from 'node:test'

test('People filters derive assigned role labels from live members', async () => {
  const source = readFileSync(new URL('../runtime/workspace/components/Team/People.vue', import.meta.url), 'utf8')
  const stateSource = source.slice(source.indexOf("const filter = ref('all')"), source.indexOf('</script>'))
  const make = compileFunction(`${stripTypeScriptTypes(stateSource)}; return { filter, options, filtered }`, ['computed', 'ref', 'watch', 'sortedMembers'])
  const members = ref([{ id: 'a', organisationRoles: ['Commis'] }, { id: 'b', organisationRoles: ['Commis', 'Operator'] }, { id: 'c', organisationRoles: [] }])
  const state = make(computed, ref, watch, members)
  assert.ok(state.options.value.some(item => item.label === 'Commis (2)'))
  state.filter.value = 'role:Commis'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['a', 'b'])
  state.filter.value = 'role:Operator'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['b'])
  state.filter.value = 'role:'
  assert.deepEqual(state.filtered.value.map(member => member.id), ['c'])
  state.filter.value = 'role:Commis'
  members.value = [members.value[2]]
  await nextTick()
  assert.equal(state.filter.value, 'all')
  assert.equal(state.filtered.value.length, 1)
  members.value = []
  await nextTick()
  assert.deepEqual(state.options.value, [{ label: 'All people (0)', value: 'all' }])
})
