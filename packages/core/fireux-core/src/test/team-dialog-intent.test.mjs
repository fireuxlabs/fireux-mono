import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref } from 'vue'
test('AI intents prepare domain-configured Team dialogs without executing mutations', async () => {
  const vue = readFileSync(new URL('../runtime/components/Workspace/Team/Crud.vue', import.meta.url), 'utf8')
  const source = vue.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1].replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  let exposed, writes = 0
  const props = { roleOptions: [{ label: 'Contributor', value: 'contributor' }, { label: 'Reviewer', value: 'reviewer' }], canEditRole: member => member.id !== 'protected', available: ['read', 'update', 'delete'], members: [{ id: 'a', name: 'Before', role: 'contributor' }], selectedMemberId: 'a', updateMember: () => { writes++ }, deactivateMember: () => { writes++ } }
  const state = compileFunction(`${stripTypeScriptTypes(source)}\nreturn { readOpen, editOpen, editName, editRole, deleteOpen, saveMember }`, ['computed', 'ref', 'defineProps', 'defineEmits', 'defineExpose', 'useToast'])(computed, ref, () => props, () => () => {}, value => { exposed = value }, () => ({ add() {} }))
  exposed.openAction({ action: 'read', name: '', message: '' })
  assert.equal(state.readOpen.value, true)
  exposed.openAction({ action: 'update', name: 'Alex', message: '' })
  assert.equal(state.editOpen.value, true)
  assert.equal(state.editName.value, 'Alex')
  exposed.openAction({ action: 'update', name: '', role: 'reviewer', message: '' })
  assert.equal(state.editRole.value, 'reviewer')
  exposed.openAction({ action: 'update', name: '', role: 'invented', message: '' })
  assert.equal(state.editRole.value, 'contributor')
  exposed.openAction({ action: 'delete', name: '', message: '' })
  assert.equal(state.deleteOpen.value, true)
  assert.equal(writes, 0)
  state.deleteOpen.value = false
  props.available = ['read']
  exposed.openAction({ action: 'delete', name: '', message: '' })
  assert.equal(state.deleteOpen.value, false)
  props.available = ['update']
  props.members[0].id = 'protected'
  props.selectedMemberId = 'protected'
  exposed.openAction({ action: 'update', name: 'Safe rename', role: 'reviewer', message: '' })
  assert.equal(state.editRole.value, 'contributor')
  let saved
  props.updateMember = async input => { saved = input }
  await state.saveMember()
  assert.deepEqual(saved, { memberId: 'protected', name: 'Safe rename' })
})
